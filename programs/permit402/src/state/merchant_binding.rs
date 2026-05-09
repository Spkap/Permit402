use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct MerchantBinding {
    pub policy: Pubkey,
    pub merchant: Pubkey,
    pub allowed: bool,
    pub per_call_cap: u64,
    pub per_merchant_cap: u64,
    pub spent: u64,
    pub bump: u8,
}
