use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::{
    constants::*,
    errors::Permit402Error,
    state::{AgentAuthority, Config, PolicyVault},
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct CreatePolicyArgs {
    pub policy_index: u64,
    pub agent_authority: Pubkey,
    pub total_cap: u64,
    pub daily_cap: u64,
    pub per_call_cap: u64,
    pub expires_at: i64,
}

#[derive(Accounts)]
#[instruction(args: CreatePolicyArgs)]
pub struct CreatePolicy<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, Config>,

    #[account(
        init,
        payer = owner,
        space = 8 + PolicyVault::INIT_SPACE,
        seeds = [POLICY_SEED, owner.key().as_ref(), &args.policy_index.to_le_bytes()],
        bump,
    )]
    pub policy_vault: Account<'info, PolicyVault>,

    #[account(
        init,
        payer = owner,
        space = 8 + AgentAuthority::INIT_SPACE,
        seeds = [
            AGENT_SEED,
            policy_vault.key().as_ref(),
            args.agent_authority.as_ref(),
        ],
        bump,
    )]
    pub agent_authority: Account<'info, AgentAuthority>,

    #[account(address = config.usdc_mint @ Permit402Error::WrongUsdcMint)]
    pub usdc_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = owner,
        associated_token::mint = usdc_mint,
        associated_token::authority = policy_vault,
    )]
    pub vault_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(_ctx: Context<CreatePolicy>, _args: CreatePolicyArgs) -> Result<()> {
    err!(Permit402Error::NotImplemented)
}
