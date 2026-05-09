#![allow(unexpected_cfgs)]
#![allow(deprecated)]

use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

pub use constants::*;
pub use errors::*;
pub use events::*;
pub use instructions::*;
pub use state::*;

declare_id!("GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S");

#[program]
pub mod permit402 {
    use super::*;

    pub fn init_config(ctx: Context<InitConfig>, args: InitConfigArgs) -> Result<()> {
        instructions::init_config::handler(ctx, args)
    }

    pub fn create_policy(ctx: Context<CreatePolicy>, args: CreatePolicyArgs) -> Result<()> {
        instructions::create_policy::handler(ctx, args)
    }

    pub fn fund_policy(ctx: Context<FundPolicy>, amount: u64) -> Result<()> {
        instructions::fund_policy::handler(ctx, amount)
    }

    pub fn register_merchant(
        ctx: Context<RegisterMerchant>,
        args: RegisterMerchantArgs,
    ) -> Result<()> {
        instructions::register_merchant::handler(ctx, args)
    }

    pub fn add_merchant(ctx: Context<AddMerchant>, args: AddMerchantArgs) -> Result<()> {
        instructions::add_merchant::handler(ctx, args)
    }

    pub fn revoke_merchant(ctx: Context<RevokeMerchant>) -> Result<()> {
        instructions::revoke_merchant::handler(ctx)
    }

    pub fn set_category_budget(
        ctx: Context<SetCategoryBudget>,
        category: u8,
        cap: u64,
    ) -> Result<()> {
        instructions::set_category_budget::handler(ctx, category, cap)
    }

    pub fn pay_x402(ctx: Context<PayX402>, args: PayX402Args) -> Result<()> {
        instructions::pay_x402::handler(ctx, args)
    }

    pub fn record_blocked_attempt(
        ctx: Context<RecordBlockedAttempt>,
        args: RecordBlockedAttemptArgs,
    ) -> Result<()> {
        instructions::record_blocked_attempt::handler(ctx, args)
    }

    pub fn close_policy(ctx: Context<ClosePolicy>) -> Result<()> {
        instructions::close_policy::handler(ctx)
    }
}
