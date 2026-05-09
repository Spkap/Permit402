import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SystemProgram, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { expect } from "chai";

import {
  bootstrap,
  CATEGORY,
  paymentReqHash,
  TestContext,
  usdc,
  ZERO_HASH,
} from "./helpers/fixtures";
import {
  findAgentAuthorityPda,
  findCategoryBudgetPda,
  findConfigPda,
  findMerchantBindingPda,
  findMerchantPda,
  findPolicyPda,
  findReceiptPda,
} from "./helpers/pda";
import { ata } from "./helpers/token";

describe("permit402: replay protection via Receipt PDA collision", () => {
  let ctx: TestContext;

  before(async () => {
    ctx = await bootstrap();
  });

  it("re-using the same nonce a second time fails (ReceiptAlreadyExists)", async () => {
    // This spec assumes Phase 5 wiring: a fully set-up policy + merchant + binding
    // + budget, plus one successful pay_x402 with nonce N. Calling pay_x402 again
    // with the same nonce must fail because the Receipt PDA is already initialized.
    //
    // Until classify_attempt + pay_x402 are implemented, this assertion fails red.
    expect.fail("TODO: full setup + duplicate nonce flow once pay_x402 is implemented");
  });

  it("the same nonce can still be recorded as a BlockedAttempt with a different attempt_hash_prefix", async () => {
    expect.fail("TODO: confirm BlockedAttempt seed uses (nonce, attempt_hash_prefix)");
  });
});
