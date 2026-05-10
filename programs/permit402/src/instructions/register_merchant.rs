use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};

use crate::{constants::*, errors::Permit402Error, state::Merchant};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct RegisterMerchantArgs {
    pub name: [u8; 32],
    pub endpoint_hash: [u8; 32],
    pub category: u8,
}

#[derive(Accounts)]
pub struct RegisterMerchant<'info> {
    #[account(mut)]
    pub registrar: Signer<'info>,

    /// CHECK: identity account for the merchant; not deserialized.
    pub merchant_wallet: UncheckedAccount<'info>,

    pub usdc_mint: Account<'info, Mint>,

    #[account(token::mint = usdc_mint, token::authority = merchant_wallet)]
    pub merchant_ata: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = registrar,
        space = 8 + Merchant::INIT_SPACE,
        seeds = [MERCHANT_SEED, merchant_wallet.key().as_ref()],
        bump,
    )]
    pub merchant: Account<'info, Merchant>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RegisterMerchant>, args: RegisterMerchantArgs) -> Result<()> {
    require!(
        args.category < NUM_CATEGORIES,
        Permit402Error::UnknownCategory
    );

    let merchant = &mut ctx.accounts.merchant;
    merchant.merchant_wallet = ctx.accounts.merchant_wallet.key();
    merchant.merchant_ata = ctx.accounts.merchant_ata.key();
    merchant.name = args.name;
    merchant.endpoint_hash = args.endpoint_hash;
    merchant.category = args.category;
    merchant.bump = ctx.bumps.merchant;

    Ok(())
}
