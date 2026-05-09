use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct CategoryBudget {
    pub policy: Pubkey,
    pub category: u8,
    pub cap: u64,
    pub spent: u64,
    pub bump: u8,
}
