use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{constants::*, state::PolicyVault};

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

pub fn handler(ctx: Context<ClosePolicy>) -> Result<()> {
    if ctx.accounts.vault_ata.amount > 0 {
        let owner = ctx.accounts.policy_vault.owner;
        let policy_index = ctx.accounts.policy_vault.policy_index;
        let policy_index_bytes = policy_index.to_le_bytes();
        let policy_bump = [ctx.accounts.policy_vault.bump];
        let signer_seeds: &[&[u8]] = &[
            POLICY_SEED,
            owner.as_ref(),
            &policy_index_bytes,
            &policy_bump,
        ];
        let signer = [signer_seeds];

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_ata.to_account_info(),
            to: ctx.accounts.owner_ata.to_account_info(),
            authority: ctx.accounts.policy_vault.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            &signer,
        );
        token::transfer(cpi_ctx, ctx.accounts.vault_ata.amount)?;
    }

    ctx.accounts.policy_vault.closed = true;
    Ok(())
}
