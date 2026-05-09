use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

use crate::{constants::*, errors::Permit402Error, state::PolicyVault};

#[derive(Accounts)]
pub struct ClosePolicy<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [POLICY_SEED, policy_vault.owner.as_ref(), &policy_vault.policy_index.to_le_bytes()],
        bump = policy_vault.bump,
        has_one = owner,
        has_one = vault_ata,
    )]
    pub policy_vault: Account<'info, PolicyVault>,

    #[account(mut)]
    pub vault_ata: Account<'info, TokenAccount>,

    #[account(mut, token::authority = owner)]
    pub owner_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(_ctx: Context<ClosePolicy>) -> Result<()> {
    err!(Permit402Error::NotImplemented)
}
