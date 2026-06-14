/**
 * Anchor program interface — replace with generated IDL after deployment.
 *
 * Deploy steps:
 * 1. anchor init hireledger-contract
 * 2. Implement anchor_document instruction storing document_hash + contract_id
 * 3. Set VITE_HIRELEDGER_PROGRAM_ID in .env
 * 4. Replace anchorDocumentHash() in client.ts with program.methods.anchorDocument(...)
 */

export interface HireLedgerContractIDL {
  version: "0.1.0";
  name: "hireledger_contract";
  instructions: [
    {
      name: "anchorDocument";
      accounts: [
        { name: "authority"; isMut: true; isSigner: true },
        { name: "documentRecord"; isMut: true; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false },
      ];
      args: [
        { name: "contractId"; type: "string" },
        { name: "documentHash"; type: { array: ["u8", 32] } },
      ];
    },
    {
      name: "verifyDocument";
      accounts: [{ name: "documentRecord"; isMut: false; isSigner: false }];
      args: [{ name: "documentHash"; type: { array: ["u8", 32] } }];
    },
  ];
}

export const ANCHOR_PROGRAM_NAME = "hireledger_contract";
