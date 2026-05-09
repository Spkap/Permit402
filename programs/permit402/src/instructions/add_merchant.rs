use anchor_lang::prelude::*;

use crate::{
    constants::*,
    errors::Permit402Error,
    state::{Merchant, MerchantBinding, PolicyVault},
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct AddMerchantArgs {
    pub per_call_cap: u64,
    pub per_merchant_cap: u64,
}

#[derive(Accounts)]
pub struct AddMerchant<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        seeds = [POLICY_SEED, policy_vault.owner.as_ref(), &policy_vault.policy_index.to_le_bytes()],
        bump = policy_vault.bump,
        has_one = owner,
    )]
    pub policy_vault: Account<'info, PolicyVault>,

    #[account(
        seeds = [MERCHANT_SEED, merchant.merchant_wallet.as_ref()],
        bump = merchant.bump,
    )]
    pub merchant: Account<'info, Merchant>,

    #[account(
        init_if_needed,
        payer = owner,
        space = 8 + MerchantBinding::INIT_SPACE,
        seeds = [
            MERCHANT_BINDING_SEED,
            policy_vault.key().as_ref(),
            merchant.key().as_ref(),
        ],
        bump,
    )]
    pub merchant_binding: Account<'info, MerchantBinding>,

    pub system_program: Program<'info, System>,
}

pub fn handler(_ctx: Context<AddMerchant>, _args: AddMerchantArgs) -> Result<()> {
    err!(Permit402Error::NotImplemented)
}
