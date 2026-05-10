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

pub fn handler(ctx: Context<SetCategoryBudget>, category: u8, cap: u64) -> Result<()> {
    require!(category < NUM_CATEGORIES, Permit402Error::UnknownCategory);
    require!(cap > 0, Permit402Error::ZeroCap);
    require!(
        cap <= ctx.accounts.policy_vault.total_cap,
        Permit402Error::InvalidCaps
    );

    let category_budget = &mut ctx.accounts.category_budget;
    let was_initialized = category_budget.policy != Pubkey::default();
    let existing_spent = if was_initialized {
        category_budget.spent
    } else {
        0
    };

    category_budget.policy = ctx.accounts.policy_vault.key();
    category_budget.category = category;
    category_budget.cap = cap;
    category_budget.spent = existing_spent;
    category_budget.bump = ctx.bumps.category_budget;

    Ok(())
}
