use anchor_lang::prelude::*;

#[constant]
pub const CONFIG_SEED: &[u8] = b"config";
#[constant]
pub const POLICY_SEED: &[u8] = b"policy";
#[constant]
pub const AGENT_SEED: &[u8] = b"agent";
#[constant]
pub const MERCHANT_SEED: &[u8] = b"merchant";
#[constant]
pub const MERCHANT_BINDING_SEED: &[u8] = b"merchant_binding";
#[constant]
pub const CATEGORY_BUDGET_SEED: &[u8] = b"category_budget";
#[constant]
pub const RECEIPT_SEED: &[u8] = b"receipt";
#[constant]
pub const BLOCKED_SEED: &[u8] = b"blocked";

#[constant]
pub const VAULT_AUTHORITY_SEED: &[u8] = b"vault";

#[constant]
pub const MAX_FEE_BPS: u16 = 500;
#[constant]
pub const MAX_MERCHANT_NAME_LEN: usize = 32;
#[constant]
pub const NUM_CATEGORIES: u8 = 4;

pub const SECONDS_PER_DAY: i64 = 86_400;
