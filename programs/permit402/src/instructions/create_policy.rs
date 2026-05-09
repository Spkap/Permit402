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

pub fn handler(ctx: Context<CreatePolicy>, args: CreatePolicyArgs) -> Result<()> {
    require!(args.total_cap > 0, Permit402Error::ZeroCap);
    require!(args.daily_cap > 0, Permit402Error::ZeroCap);
    require!(args.per_call_cap > 0, Permit402Error::ZeroCap);
    require!(
        args.daily_cap <= args.total_cap,
        Permit402Error::DailyCapExceedsTotal
    );
    require!(
        args.per_call_cap <= args.daily_cap,
        Permit402Error::PerCallCapExceedsDaily
    );

    let clock = Clock::get()?;
    require!(args.expires_at > clock.unix_timestamp, Permit402Error::InvalidExpiry);

    let policy_vault = &mut ctx.accounts.policy_vault;
    policy_vault.owner = ctx.accounts.owner.key();
    policy_vault.agent_authority = args.agent_authority;
    policy_vault.vault_ata = ctx.accounts.vault_ata.key();
    policy_vault.usdc_mint = ctx.accounts.usdc_mint.key();
    policy_vault.policy_index = args.policy_index;
    policy_vault.total_cap = args.total_cap;
    policy_vault.total_spent = 0;
    policy_vault.daily_cap = args.daily_cap;
    policy_vault.spent_today = 0;
    policy_vault.current_day = clock.unix_timestamp / SECONDS_PER_DAY;
    policy_vault.default_per_call_cap = args.per_call_cap;
    policy_vault.expires_at = args.expires_at;
    policy_vault.closed = false;
    policy_vault.bump = ctx.bumps.policy_vault;

    let agent_authority = &mut ctx.accounts.agent_authority;
    agent_authority.policy = policy_vault.key();
    agent_authority.authority = args.agent_authority;
    agent_authority.bump = ctx.bumps.agent_authority;

    Ok(())
}
