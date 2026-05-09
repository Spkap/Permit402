use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

use crate::{
    constants::*,
    errors::Permit402Error,
    state::{BlockedAttempt, Config, Merchant, PolicyVault},
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
    _ctx: Context<RecordBlockedAttempt>,
    _args: RecordBlockedAttemptArgs,
) -> Result<()> {
    err!(Permit402Error::NotImplemented)
}
