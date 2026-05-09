use anchor_lang::prelude::*;

/// Block reasons in the canonical priority order from plan §8.5.
/// The integer value of each variant must remain stable: shared TS package,
/// frontend, and tests all rely on this exact order.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u8)]
pub enum BlockReason {
    UnauthorizedAgent = 0,
    PolicyExpired = 1,
    MerchantNotAllowed = 2,
    ReceiptAlreadyExists = 3,
    PerCallCapExceeded = 4,
    MerchantCapExceeded = 5,
    CategoryCapExceeded = 6,
    TotalCapExceeded = 7,
    DailyCapExceeded = 8,
    PaymentRequestHashMismatch = 9,
}

impl BlockReason {
    pub fn as_u8(self) -> u8 {
        self as u8
    }
}

#[error_code]
pub enum Permit402Error {
    // --- Block-reason mirrors (priority order) ---
    #[msg("Unauthorized agent")] // 0
    UnauthorizedAgent,
    #[msg("Policy expired")] // 1
    PolicyExpired,
    #[msg("Merchant not allowed")] // 2
    MerchantNotAllowed,
    #[msg("Receipt already exists for this nonce")] // 3
    ReceiptAlreadyExists,
    #[msg("Per-call cap exceeded")] // 4
    PerCallCapExceeded,
    #[msg("Per-merchant cap exceeded")] // 5
    MerchantCapExceeded,
    #[msg("Category cap exceeded")] // 6
    CategoryCapExceeded,
    #[msg("Total cap exceeded")] // 7
    TotalCapExceeded,
    #[msg("Daily cap exceeded")] // 8
    DailyCapExceeded,
    #[msg("Payment request hash mismatch")] // 9
    PaymentRequestHashMismatch,

    // --- Operational errors ---
    #[msg("Instruction not implemented yet")]
    NotImplemented,
    #[msg("Amount must be non-zero")]
    ZeroAmount,
    #[msg("Cap must be non-zero")]
    ZeroCap,
    #[msg("Invalid cap configuration")]
    InvalidCaps,
    #[msg("Daily cap cannot exceed total cap")]
    DailyCapExceedsTotal,
    #[msg("Per-call cap cannot exceed daily cap")]
    PerCallCapExceedsDaily,
    #[msg("Per-call cap cannot exceed per-merchant cap")]
    PerCallCapExceedsMerchant,
    #[msg("Expiry must be in the future")]
    InvalidExpiry,
    #[msg("X402 request expired")]
    X402RequestExpired,
    #[msg("Mint mismatch")]
    MintMismatch,
    #[msg("Wrong USDC mint")]
    WrongUsdcMint,
    #[msg("Vault ATA owner mismatch")]
    VaultAtaOwnerMismatch,
    #[msg("Policy is closed")]
    PolicyClosed,
    #[msg("Recorder must be keeper or attempted authority")]
    RecorderNotPermitted,
    #[msg("Only the keeper authority may record a payment-hash mismatch")]
    KeeperOnlyMismatch,
    #[msg("Attempt would have passed; refusing to write a blocked-attempt artifact")]
    AttemptWouldPass,
    #[msg("Payment request hash must be non-zero")]
    EmptyPaymentRequestHash,
    #[msg("Unknown merchant category")]
    UnknownCategory,
    #[msg("Fee bps exceeds maximum")]
    FeeBpsTooHigh,
    #[msg("Merchant name exceeds maximum length")]
    MerchantNameTooLong,
    #[msg("Math overflow")]
    MathOverflow,
}
