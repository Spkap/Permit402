pub mod add_merchant;
pub mod close_policy;
pub mod create_policy;
pub mod fund_policy;
pub mod init_config;
pub mod pay_x402;
pub mod record_blocked_attempt;
pub mod register_merchant;
pub mod revoke_merchant;
pub mod set_category_budget;

// Glob re-exports are required so Anchor's #[program] macro can resolve
// `crate::__client_accounts_*` and `crate::__cpi_client_accounts_*` modules
// that are generated alongside each Accounts struct. The benign side effect
// is that each module's `handler` fn becomes ambiguous at this level — we
// always call them via fully-qualified `instructions::<module>::handler(...)`
// from lib.rs, so the ambiguity is harmless.
#[allow(ambiguous_glob_reexports)]
pub use add_merchant::*;
#[allow(ambiguous_glob_reexports)]
pub use close_policy::*;
#[allow(ambiguous_glob_reexports)]
pub use create_policy::*;
#[allow(ambiguous_glob_reexports)]
pub use fund_policy::*;
#[allow(ambiguous_glob_reexports)]
pub use init_config::*;
#[allow(ambiguous_glob_reexports)]
pub use pay_x402::*;
#[allow(ambiguous_glob_reexports)]
pub use record_blocked_attempt::*;
#[allow(ambiguous_glob_reexports)]
pub use register_merchant::*;
#[allow(ambiguous_glob_reexports)]
pub use revoke_merchant::*;
#[allow(ambiguous_glob_reexports)]
pub use set_category_budget::*;
