use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Merchant {
    pub merchant_wallet: Pubkey,
    pub merchant_ata: Pubkey,
    pub name: [u8; 32],
    pub endpoint_hash: [u8; 32],
    pub category: u8,
    pub bump: u8,
}
