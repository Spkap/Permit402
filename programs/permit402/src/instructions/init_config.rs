use anchor_lang::prelude::*;

use crate::{constants::*, errors::Permit402Error, state::Config};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct InitConfigArgs {
    pub usdc_mint: Pubkey,
    pub keeper_authority: Pubkey,
    pub fee_bps: u16,
}

#[derive(Accounts)]
pub struct InitConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + Config::INIT_SPACE,
        seeds = [CONFIG_SEED],
        bump,
    )]
    pub config: Account<'info, Config>,
    pub system_program: Program<'info, System>,
}

pub fn handler(_ctx: Context<InitConfig>, _args: InitConfigArgs) -> Result<()> {
    err!(Permit402Error::NotImplemented)
}
