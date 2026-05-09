use anchor_lang::prelude::*;

#[event]
pub struct X402Paid {
    pub policy: Pubkey,
    pub merchant: Pubkey,
    pub agent_authority: Pubkey,
    pub amount: u64,
    pub category: u8,
    pub nonce: u64,
    pub payment_req_hash: [u8; 32],
    pub created_at: i64,
}

#[event]
pub struct X402Blocked {
    pub policy: Pubkey,
    pub merchant: Pubkey,
    pub attempted_authority: Pubkey,
    pub recorder: Pubkey,
    pub amount: u64,
    pub category: u8,
    pub nonce: u64,
    pub reason: u8,
    pub payment_req_hash: [u8; 32],
    pub expected_payment_req_hash: [u8; 32],
    pub created_at: i64,
}
