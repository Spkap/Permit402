use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,
    pub usdc_mint: Pubkey,
    pub keeper_authority: Pubkey,
    pub fee_bps: u16,
    pub bump: u8,
}
