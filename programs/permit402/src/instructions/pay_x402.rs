use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{
    constants::*,
    errors::Permit402Error,
    events::X402Paid,
    policy_logic::{classify_attempt, current_day, spent_today, AttemptPolicy},
    state::{
        AgentAuthority, CategoryBudget, Config, Merchant, MerchantBinding, PolicyVault, Receipt,
    },
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct PayX402Args {
    pub amount: u64,
    pub category: u8,
    pub nonce: u64,
    pub payment_req_hash: [u8; 32],
    pub settlement_signature_hash: [u8; 32],
    pub request_expires_at: i64,
}

#[derive(Accounts)]
#[instruction(args: PayX402Args)]
pub struct PayX402<'info> {
    /// Signer is either the policy's agent_authority or the configured keeper.
    #[account(mut)]
    pub signer_authority: Signer<'info>,

    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Box<Account<'info, Config>>,

    #[account(
        mut,
        seeds = [POLICY_SEED, policy_vault.owner.as_ref(), &policy_vault.policy_index.to_le_bytes()],
        bump = policy_vault.bump,
        has_one = vault_ata,
    )]
    pub policy_vault: Box<Account<'info, PolicyVault>>,

    #[account(
        seeds = [
            AGENT_SEED,
            policy_vault.key().as_ref(),
            policy_vault.agent_authority.as_ref(),
        ],
        bump = agent_authority.bump,
    )]
    pub agent_authority: Box<Account<'info, AgentAuthority>>,

    #[account(
        seeds = [MERCHANT_SEED, merchant.merchant_wallet.as_ref()],
        bump = merchant.bump,
    )]
    pub merchant: Box<Account<'info, Merchant>>,

    #[account(
        mut,
        seeds = [
            MERCHANT_BINDING_SEED,
            policy_vault.key().as_ref(),
            merchant.key().as_ref(),
        ],
        bump = merchant_binding.bump,
    )]
    pub merchant_binding: Box<Account<'info, MerchantBinding>>,

    #[account(
        mut,
        seeds = [
            CATEGORY_BUDGET_SEED,
            policy_vault.key().as_ref(),
            &[args.category],
        ],
        bump = category_budget.bump,
    )]
    pub category_budget: Box<Account<'info, CategoryBudget>>,

    #[account(mut)]
    pub vault_ata: Box<Account<'info, TokenAccount>>,

    #[account(mut, address = merchant.merchant_ata @ Permit402Error::MintMismatch)]
    pub merchant_ata: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = signer_authority,
        space = 8 + Receipt::INIT_SPACE,
        seeds = [
            RECEIPT_SEED,
            policy_vault.key().as_ref(),
            &args.nonce.to_le_bytes(),
        ],
        bump,
    )]
    pub receipt: Box<Account<'info, Receipt>>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(ctx: Context<PayX402>, args: PayX402Args) -> Result<()> {
    let now = ctx.accounts.clock.unix_timestamp;
    let attempted_authority = ctx.accounts.signer_authority.key();
    let reason = classify_attempt(AttemptPolicy {
        config: &ctx.accounts.config,
        policy_vault: &ctx.accounts.policy_vault,
        merchant: &ctx.accounts.merchant,
        merchant_binding: Some(&ctx.accounts.merchant_binding),
        category_budget: Some(&ctx.accounts.category_budget),
        attempted_authority,
        amount: args.amount,
        category: args.category,
        payment_req_hash: args.payment_req_hash,
        expected_payment_req_hash: None,
        receipt_exists: false,
        request_expires_at: args.request_expires_at,
        now,
    })?;

    if let Some(reason) = reason {
        return match reason {
            crate::errors::BlockReason::UnauthorizedAgent => err!(Permit402Error::UnauthorizedAgent),
            crate::errors::BlockReason::PolicyExpired => err!(Permit402Error::PolicyExpired),
            crate::errors::BlockReason::MerchantNotAllowed => err!(Permit402Error::MerchantNotAllowed),
            crate::errors::BlockReason::ReceiptAlreadyExists => err!(Permit402Error::ReceiptAlreadyExists),
            crate::errors::BlockReason::PerCallCapExceeded => err!(Permit402Error::PerCallCapExceeded),
            crate::errors::BlockReason::MerchantCapExceeded => err!(Permit402Error::MerchantCapExceeded),
            crate::errors::BlockReason::CategoryCapExceeded => err!(Permit402Error::CategoryCapExceeded),
            crate::errors::BlockReason::TotalCapExceeded => err!(Permit402Error::TotalCapExceeded),
            crate::errors::BlockReason::DailyCapExceeded => err!(Permit402Error::DailyCapExceeded),
            crate::errors::BlockReason::PaymentRequestHashMismatch => {
                err!(Permit402Error::PaymentRequestHashMismatch)
            }
        };
    }

    let policy_key = ctx.accounts.policy_vault.key();
    let owner = ctx.accounts.policy_vault.owner;
    let policy_index = ctx.accounts.policy_vault.policy_index;
    let signer_seeds: &[&[u8]] = &[
        POLICY_SEED,
        owner.as_ref(),
        &policy_index.to_le_bytes(),
        &[ctx.accounts.policy_vault.bump],
    ];

    let cpi_accounts = Transfer {
        from: ctx.accounts.vault_ata.to_account_info(),
        to: ctx.accounts.merchant_ata.to_account_info(),
        authority: ctx.accounts.policy_vault.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        &[signer_seeds],
    );
    token::transfer(cpi_ctx, args.amount)?;

    let today = current_day(now);
    if ctx.accounts.policy_vault.current_day != today {
        ctx.accounts.policy_vault.current_day = today;
        ctx.accounts.policy_vault.spent_today = 0;
    }
    ctx.accounts.policy_vault.total_spent = ctx
        .accounts
        .policy_vault
        .total_spent
        .checked_add(args.amount)
        .ok_or(Permit402Error::MathOverflow)?;
    ctx.accounts.policy_vault.spent_today = spent_today(&ctx.accounts.policy_vault, now)
        .checked_add(args.amount)
        .ok_or(Permit402Error::MathOverflow)?;
    ctx.accounts.merchant_binding.spent = ctx
        .accounts
        .merchant_binding
        .spent
        .checked_add(args.amount)
        .ok_or(Permit402Error::MathOverflow)?;
    ctx.accounts.category_budget.spent = ctx
        .accounts
        .category_budget
        .spent
        .checked_add(args.amount)
        .ok_or(Permit402Error::MathOverflow)?;

    let receipt = &mut ctx.accounts.receipt;
    receipt.policy = policy_key;
    receipt.merchant = ctx.accounts.merchant.key();
    receipt.amount = args.amount;
    receipt.category = args.category;
    receipt.nonce = args.nonce;
    receipt.payment_req_hash = args.payment_req_hash;
    receipt.settlement_signature_hash = args.settlement_signature_hash;
    receipt.created_at = now;
    receipt.bump = ctx.bumps.receipt;

    emit!(X402Paid {
        policy: policy_key,
        merchant: ctx.accounts.merchant.key(),
        agent_authority: attempted_authority,
        amount: args.amount,
        category: args.category,
        nonce: args.nonce,
        payment_req_hash: args.payment_req_hash,
        created_at: now,
    });

    Ok(())
}
