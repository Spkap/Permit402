use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Receipt {
    pub policy: Pubkey,
    pub merchant: Pubkey,
    pub amount: u64,
    pub category: u8,
    pub nonce: u64,
    pub payment_req_hash: [u8; 32],
    pub settlement_signature_hash: [u8; 32],
    pub created_at: i64,
    pub bump: u8,
}
