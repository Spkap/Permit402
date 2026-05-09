use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

use crate::{
    constants::*,
    errors::{BlockReason, Permit402Error},
    events::X402Blocked,
    policy_logic::{classify_attempt, AttemptPolicy},
    state::{BlockedAttempt, CategoryBudget, Config, Merchant, MerchantBinding, PolicyVault},
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct RecordBlockedAttemptArgs {
    pub attempted_authority: Pubkey,
    pub amount: u64,
    pub category: u8,
    pub nonce: u64,
    pub payment_req_hash: [u8; 32],
    pub expected_payment_req_hash: [u8; 32],
    pub claimed_reason: u8,
    pub attempt_hash_prefix: [u8; 8],
    pub request_expires_at: i64,
}

#[derive(Accounts)]
#[instruction(args: RecordBlockedAttemptArgs)]
pub struct RecordBlockedAttempt<'info> {
    /// Recorder must be either the keeper authority or equal to attempted_authority
    /// (so unauthorized agents can sign their own failed attempts).
    #[account(mut)]
    pub recorder: Signer<'info>,

    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Box<Account<'info, Config>>,

    #[account(
        seeds = [POLICY_SEED, policy_vault.owner.as_ref(), &policy_vault.policy_index.to_le_bytes()],
        bump = policy_vault.bump,
    )]
    pub policy_vault: Box<Account<'info, PolicyVault>>,

    #[account(
        seeds = [MERCHANT_SEED, merchant.merchant_wallet.as_ref()],
        bump = merchant.bump,
    )]
    pub merchant: Box<Account<'info, Merchant>>,

    /// MerchantBinding may not exist (MerchantNotAllowed). Use UncheckedAccount and
    /// re-derive in the handler so we don't fail account loading for that reason.
    /// CHECK: re-derived and validated by the handler when present.
    pub merchant_binding: UncheckedAccount<'info>,

    /// CHECK: re-derived and validated by the handler when present (CategoryBudget may not exist).
    pub category_budget: UncheckedAccount<'info>,

    pub vault_ata: Box<Account<'info, TokenAccount>>,

    /// CHECK: receipt PDA used to detect ReceiptAlreadyExists. May or may not exist.
    pub receipt: UncheckedAccount<'info>,

    #[account(
        init,
        payer = recorder,
        space = 8 + BlockedAttempt::INIT_SPACE,
        seeds = [
            BLOCKED_SEED,
            policy_vault.key().as_ref(),
            &args.nonce.to_le_bytes(),
            &args.attempt_hash_prefix,
        ],
        bump,
    )]
    pub blocked_attempt: Box<Account<'info, BlockedAttempt>>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(
    ctx: Context<RecordBlockedAttempt>,
    args: RecordBlockedAttemptArgs,
) -> Result<()> {
    let recorder = ctx.accounts.recorder.key();
    require!(
        recorder == args.attempted_authority || recorder == ctx.accounts.config.keeper_authority,
        Permit402Error::RecorderNotPermitted
    );

    let merchant_binding_key = Pubkey::find_program_address(
        &[
            MERCHANT_BINDING_SEED,
            ctx.accounts.policy_vault.key().as_ref(),
            ctx.accounts.merchant.key().as_ref(),
        ],
        ctx.program_id,
    )
    .0;
    let category_budget_key = Pubkey::find_program_address(
        &[
            CATEGORY_BUDGET_SEED,
            ctx.accounts.policy_vault.key().as_ref(),
            &[args.category],
        ],
        ctx.program_id,
    )
    .0;

    let merchant_binding = if ctx.accounts.merchant_binding.key() == merchant_binding_key
        && !ctx.accounts.merchant_binding.data_is_empty()
    {
        Some(Account::<MerchantBinding>::try_from(&ctx.accounts.merchant_binding)?)
    } else {
        None
    };
    let category_budget = if ctx.accounts.category_budget.key() == category_budget_key
        && !ctx.accounts.category_budget.data_is_empty()
    {
        Some(Account::<CategoryBudget>::try_from(&ctx.accounts.category_budget)?)
    } else {
        None
    };
    let receipt_exists = !ctx.accounts.receipt.data_is_empty();

    let now = ctx.accounts.clock.unix_timestamp;
    let expected = if args.expected_payment_req_hash != args.payment_req_hash {
        Some(args.expected_payment_req_hash)
    } else {
        None
    };

    let reason = classify_attempt(AttemptPolicy {
        config: &ctx.accounts.config,
        policy_vault: &ctx.accounts.policy_vault,
        merchant: &ctx.accounts.merchant,
        merchant_binding: merchant_binding.as_deref(),
        category_budget: category_budget.as_deref(),
        attempted_authority: args.attempted_authority,
        amount: args.amount,
        category: args.category,
        payment_req_hash: args.payment_req_hash,
        expected_payment_req_hash: expected,
        receipt_exists,
        request_expires_at: args.request_expires_at,
        now,
    })?
    .ok_or(Permit402Error::AttemptWouldPass)?;

    require!(
        reason.as_u8() == args.claimed_reason,
        Permit402Error::InvalidCaps
    );
    if reason == BlockReason::PaymentRequestHashMismatch {
        require!(
            recorder == ctx.accounts.config.keeper_authority,
            Permit402Error::KeeperOnlyMismatch
        );
    }

    let blocked_attempt = &mut ctx.accounts.blocked_attempt;
    blocked_attempt.policy = ctx.accounts.policy_vault.key();
    blocked_attempt.merchant = ctx.accounts.merchant.key();
    blocked_attempt.attempted_authority = args.attempted_authority;
    blocked_attempt.recorder = recorder;
    blocked_attempt.amount = args.amount;
    blocked_attempt.category = args.category;
    blocked_attempt.nonce = args.nonce;
    blocked_attempt.payment_req_hash = args.payment_req_hash;
    blocked_attempt.expected_payment_req_hash = args.expected_payment_req_hash;
    blocked_attempt.reason = reason.as_u8();
    blocked_attempt.created_at = now;
    blocked_attempt.bump = ctx.bumps.blocked_attempt;

    emit!(X402Blocked {
        policy: ctx.accounts.policy_vault.key(),
        merchant: ctx.accounts.merchant.key(),
        attempted_authority: args.attempted_authority,
        recorder,
        amount: args.amount,
        category: args.category,
        nonce: args.nonce,
        reason: reason.as_u8(),
        payment_req_hash: args.payment_req_hash,
        expected_payment_req_hash: args.expected_payment_req_hash,
        created_at: now,
    });

    Ok(())
}
