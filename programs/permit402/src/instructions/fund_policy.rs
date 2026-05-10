use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

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

pub fn handler(ctx: Context<FundPolicy>, amount: u64) -> Result<()> {
    require!(amount > 0, Permit402Error::ZeroAmount);
    require!(
        !ctx.accounts.policy_vault.closed,
        Permit402Error::PolicyClosed
    );

    let cpi_accounts = Transfer {
        from: ctx.accounts.owner_ata.to_account_info(),
        to: ctx.accounts.vault_ata.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    Ok(())
}
