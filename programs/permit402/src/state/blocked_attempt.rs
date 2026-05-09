use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct BlockedAttempt {
    pub policy: Pubkey,
    pub merchant: Pubkey,
    pub attempted_authority: Pubkey,
    pub recorder: Pubkey,
    pub amount: u64,
    pub category: u8,
    pub nonce: u64,
    pub payment_req_hash: [u8; 32],
    pub expected_payment_req_hash: [u8; 32],
    pub reason: u8,
    pub created_at: i64,
    pub bump: u8,
}
