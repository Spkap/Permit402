use anchor_lang::prelude::*;

use crate::{
    constants::SECONDS_PER_DAY,
    errors::{BlockReason, Permit402Error},
    state::{CategoryBudget, Config, Merchant, MerchantBinding, PolicyVault},
};

pub struct AttemptPolicy<'a> {
    pub config: &'a Config,
    pub policy_key: Pubkey,
    pub policy_vault: &'a PolicyVault,
    pub merchant_key: Pubkey,
    pub merchant: &'a Merchant,
    pub merchant_binding: Option<&'a MerchantBinding>,
    pub category_budget: Option<&'a CategoryBudget>,
    pub attempted_authority: Pubkey,
    pub amount: u64,
    pub category: u8,
    pub payment_req_hash: [u8; 32],
    pub expected_payment_req_hash: Option<[u8; 32]>,
    pub receipt_exists: bool,
    pub request_expires_at: i64,
    pub now: i64,
}

pub fn is_zero_hash(hash: &[u8; 32]) -> bool {
    hash.iter().all(|b| *b == 0)
}

pub fn current_day(now: i64) -> i64 {
    now / SECONDS_PER_DAY
}

pub fn spent_today(policy_vault: &PolicyVault, now: i64) -> u64 {
    if current_day(now) == policy_vault.current_day {
        policy_vault.spent_today
    } else {
        0
    }
}

pub fn classify_attempt(input: AttemptPolicy<'_>) -> Result<Option<BlockReason>> {
    if input.attempted_authority != input.policy_vault.agent_authority
        && input.attempted_authority != input.config.keeper_authority
    {
        return Ok(Some(BlockReason::UnauthorizedAgent));
    }

    if input.policy_vault.closed || input.policy_vault.expires_at <= input.now {
        return Ok(Some(BlockReason::PolicyExpired));
    }

    if input.request_expires_at <= input.now {
        return Ok(Some(BlockReason::PolicyExpired));
    }

    let Some(merchant_binding) = input.merchant_binding else {
        return Ok(Some(BlockReason::MerchantNotAllowed));
    };

    if !merchant_binding.allowed || merchant_binding.policy != input.policy_key {
        return Ok(Some(BlockReason::MerchantNotAllowed));
    }

    if merchant_binding.merchant != input.merchant_key {
        return Ok(Some(BlockReason::MerchantNotAllowed));
    }

    if input.receipt_exists {
        return Ok(Some(BlockReason::ReceiptAlreadyExists));
    }

    require!(input.amount > 0, Permit402Error::ZeroAmount);
    require!(
        !is_zero_hash(&input.payment_req_hash),
        Permit402Error::EmptyPaymentRequestHash
    );

    if input.amount > merchant_binding.per_call_cap
        || input.amount > input.policy_vault.default_per_call_cap
    {
        return Ok(Some(BlockReason::PerCallCapExceeded));
    }

    let merchant_total = merchant_binding
        .spent
        .checked_add(input.amount)
        .ok_or(Permit402Error::MathOverflow)?;
    if merchant_total > merchant_binding.per_merchant_cap {
        return Ok(Some(BlockReason::MerchantCapExceeded));
    }

    let Some(category_budget) = input.category_budget else {
        return Ok(Some(BlockReason::CategoryCapExceeded));
    };

    if category_budget.category != input.category || input.merchant.category != input.category {
        return Ok(Some(BlockReason::CategoryCapExceeded));
    }

    let category_total = category_budget
        .spent
        .checked_add(input.amount)
        .ok_or(Permit402Error::MathOverflow)?;
    if category_total > category_budget.cap {
        return Ok(Some(BlockReason::CategoryCapExceeded));
    }

    let total = input
        .policy_vault
        .total_spent
        .checked_add(input.amount)
        .ok_or(Permit402Error::MathOverflow)?;
    if total > input.policy_vault.total_cap {
        return Ok(Some(BlockReason::TotalCapExceeded));
    }

    let daily = spent_today(input.policy_vault, input.now)
        .checked_add(input.amount)
        .ok_or(Permit402Error::MathOverflow)?;
    if daily > input.policy_vault.daily_cap {
        return Ok(Some(BlockReason::DailyCapExceeded));
    }

    if let Some(expected) = input.expected_payment_req_hash {
        if expected != input.payment_req_hash {
            return Ok(Some(BlockReason::PaymentRequestHashMismatch));
        }
    }

    Ok(None)
}
