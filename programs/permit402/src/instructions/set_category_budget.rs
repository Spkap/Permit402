use anchor_lang::prelude::*;

use crate::{
    constants::*,
    errors::Permit402Error,
    state::{CategoryBudget, PolicyVault},
};

#[derive(Accounts)]
#[instruction(category: u8)]
pub struct SetCategoryBudget<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        seeds = [POLICY_SEED, policy_vault.owner.as_ref(), &policy_vault.policy_index.to_le_bytes()],
        bump = policy_vault.bump,
        has_one = owner,
    )]
    pub policy_vault: Account<'info, PolicyVault>,

    #[account(
        init_if_needed,
        payer = owner,
        space = 8 + CategoryBudget::INIT_SPACE,
        seeds = [
            CATEGORY_BUDGET_SEED,
            policy_vault.key().as_ref(),
            &[category],
        ],
        bump,
    )]
    pub category_budget: Account<'info, CategoryBudget>,

    pub system_program: Program<'info, System>,
}

pub fn handler(_ctx: Context<SetCategoryBudget>, _category: u8, _cap: u64) -> Result<()> {
    err!(Permit402Error::NotImplemented)
}
