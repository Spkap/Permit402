export enum MerchantCategory {
  Research = 0,
  Translate = 1,
  Storage = 2,
  Tooling = 3,
}

export const MERCHANT_CATEGORY_ORDER = [
  MerchantCategory.Research,
  MerchantCategory.Translate,
  MerchantCategory.Storage,
  MerchantCategory.Tooling,
] as const;

export const CATEGORY = {
  RESEARCH: MerchantCategory.Research,
  TRANSLATE: MerchantCategory.Translate,
  STORAGE: MerchantCategory.Storage,
  TOOLING: MerchantCategory.Tooling,
} as const;
