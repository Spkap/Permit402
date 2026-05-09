use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{constants::*, errors::Permit402Error, state::PolicyVault};

#[derive(Accounts)]
pub struct FundPolicy<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [POLICY_SEED, policy_vault.owner.as_ref(), &policy_vault.policy_index.to_le_bytes()],
        bump = policy_vault.bump,
        has_one = owner,
        has_one = usdc_mint,
        has_one = vault_ata,
    )]
    pub policy_vault: Account<'info, PolicyVault>,

    pub usdc_mint: Account<'info, Mint>,

    #[account(mut, token::mint = usdc_mint, token::authority = owner)]
    pub owner_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(_ctx: Context<FundPolicy>, _amount: u64) -> Result<()> {
    err!(Permit402Error::NotImplemented)
}
