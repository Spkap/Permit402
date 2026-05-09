use anchor_lang::prelude::*;

use crate::{
    constants::*,
    errors::Permit402Error,
    state::{MerchantBinding, PolicyVault},
};

#[derive(Accounts)]
pub struct RevokeMerchant<'info> {
    pub owner: Signer<'info>,

    #[account(
        seeds = [POLICY_SEED, policy_vault.owner.as_ref(), &policy_vault.policy_index.to_le_bytes()],
        bump = policy_vault.bump,
        has_one = owner,
    )]
    pub policy_vault: Account<'info, PolicyVault>,

    #[account(
        mut,
        seeds = [
            MERCHANT_BINDING_SEED,
            policy_vault.key().as_ref(),
            merchant_binding.merchant.as_ref(),
        ],
        bump = merchant_binding.bump,
    )]
    pub merchant_binding: Account<'info, MerchantBinding>,
}

pub fn handler(_ctx: Context<RevokeMerchant>) -> Result<()> {
    err!(Permit402Error::NotImplemented)
}
