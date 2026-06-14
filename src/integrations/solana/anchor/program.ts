import { PublicKey } from "@solana/web3.js";
import { hireLedgerIdl, ANCHOR_PROGRAM_NAME } from "./idl";

export const HIRELEDGER_ANCHOR_PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_HIRELEDGER_PROGRAM_ID || "11111111111111111111111111111111",
);

export function getAnchorIdl() {
  return hireLedgerIdl;
}

export function getAnchorProgramName() {
  return ANCHOR_PROGRAM_NAME;
}
