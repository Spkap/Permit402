use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

use crate::{
    constants::*,
    errors::Permit402Error,
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

pub fn handler(_ctx: Context<PayX402>, _args: PayX402Args) -> Result<()> {
    err!(Permit402Error::NotImplemented)
}
