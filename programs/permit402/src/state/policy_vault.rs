use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PolicyVault {
    pub owner: Pubkey,
    pub agent_authority: Pubkey,
    pub vault_ata: Pubkey,
    pub usdc_mint: Pubkey,
    pub policy_index: u64,
    pub total_cap: u64,
    pub total_spent: u64,
    pub daily_cap: u64,
    pub spent_today: u64,
    pub current_day: i64,
    pub default_per_call_cap: u64,
    pub expires_at: i64,
    pub closed: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct AgentAuthority {
    pub policy: Pubkey,
    pub authority: Pubkey,
    pub bump: u8,
}
