export enum BlockReason {
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

export const BLOCK_REASON_ORDER = [
  BlockReason.UnauthorizedAgent,
  BlockReason.PolicyExpired,
  BlockReason.MerchantNotAllowed,
  BlockReason.ReceiptAlreadyExists,
  BlockReason.PerCallCapExceeded,
  BlockReason.MerchantCapExceeded,
  BlockReason.CategoryCapExceeded,
  BlockReason.TotalCapExceeded,
  BlockReason.DailyCapExceeded,
  BlockReason.PaymentRequestHashMismatch,
] as const;

export type BlockReasonName = keyof typeof BlockReason;
