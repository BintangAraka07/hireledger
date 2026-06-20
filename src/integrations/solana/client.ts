import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";
import { SOLANA_NETWORK, SOLANA_RPC_URL, SOLANA_EXPLORER_BASE } from "@/lib/constants";

/** Anchor-ready program ID placeholder — replace after deploying Anchor program */
export const HIRELEDGER_PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_HIRELEDGER_PROGRAM_ID || "11111111111111111111111111111111",
);

let connection: Connection | null = null;

export function getConnection(): Connection {
  if (!connection) {
    const endpoint = SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK as "devnet" | "mainnet-beta" | "testnet");
    console.log("🌐 [getConnection] Creating connection:", {
      network: SOLANA_NETWORK,
      rpcUrl: endpoint,
    });
    connection = new Connection(endpoint, "confirmed");
  }
  return connection;
}

export function getExplorerUrl(signature: string): string {
  const cluster = SOLANA_NETWORK === "mainnet-beta" ? "" : `?cluster=${SOLANA_NETWORK}`;
  return `${SOLANA_EXPLORER_BASE}/tx/${signature}${cluster}`;
}

export function getAddressExplorerUrl(address: string): string {
  const cluster = SOLANA_NETWORK === "mainnet-beta" ? "" : `?cluster=${SOLANA_NETWORK}`;
  return `${SOLANA_EXPLORER_BASE}/address/${address}${cluster}`;
}

export async function getSolBalance(publicKey: PublicKey): Promise<number> {
  const conn = getConnection();
  console.log("💰 [getSolBalance] Checking balance for:", publicKey.toBase58());
  const lamports = await conn.getBalance(publicKey);
  const sol = lamports / LAMPORTS_PER_SOL;
  console.log("💰 [getSolBalance] Balance result:", {
    lamports,
    sol,
    address: publicKey.toBase58().substring(0, 10) + "...",
  });
  return sol;
}

export async function getRecentTransactions(publicKey: PublicKey, limit = 10) {
  const conn = getConnection();
  const signatures = await conn.getSignaturesForAddress(publicKey, { limit });

  const txs = await Promise.all(
    signatures.map(async (sig) => {
      const tx = await conn.getTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0,
      });
      return {
        signature: sig.signature,
        slot: sig.slot,
        blockTime: sig.blockTime,
        err: sig.err,
        fee: tx?.meta?.fee ?? 0,
        explorerUrl: getExplorerUrl(sig.signature),
      };
    }),
  );

  return txs;
}

/**
 * Anchor document hash to Solana Devnet via memo transaction.
 * Production: replace with Anchor program instruction.
 */
export async function anchorDocumentHash(
  walletPublicKey: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  documentHash: string,
  contractId: string,
): Promise<{ signature: string; slot: number }> {
  const conn = getConnection();
  const memo = `HireLedger:PKWT:${contractId}:${documentHash}`;
  const walletAddress = walletPublicKey.toBase58();

  // ✅ STEP 1: Validate wallet account exists and has SOL
  console.log("🔍 [anchorDocumentHash] Checking wallet account on devnet...", {
    wallet: walletAddress,
  });

  try {
    const balance = await getSolBalance(walletPublicKey);
    console.log("✅ [anchorDocumentHash] Wallet balance:", {
      wallet: walletAddress,
      balanceSOL: balance,
      lamports: balance * LAMPORTS_PER_SOL,
    });

    if (balance < 0.001) {
      throw new Error(
        `❌ Insufficient balance: ${balance} SOL. Need at least 0.001 SOL for transaction fee.\n\n` +
        `To fix:\n` +
        `1. Go to https://faucet.solana.com/\n` +
        `2. Paste your wallet address: ${walletAddress}\n` +
        `3. Request airdrop (2 SOL)\n` +
        `4. Wait 1-2 minutes\n` +
        `5. Try again`
      );
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("Insufficient balance")) {
      throw err; // Re-throw our custom error
    }
    console.error("❌ [anchorDocumentHash] Failed to check wallet balance:", err);
    throw new Error(
      `❌ Wallet account not found on Solana Devnet!\n\n` +
      `Wallet: ${walletAddress}\n\n` +
      `To fix:\n` +
      `1. Open Solana CLI and run:\n` +
      `   solana airdrop 2 ${walletAddress} --url devnet\n\n` +
      `2. Or use the web faucet:\n` +
      `   https://faucet.solana.com/\n\n` +
      `3. Then refresh this page and try again`
    );
  }

  // ✅ STEP 2: Build memo instruction 
  console.log("🔍 [anchorDocumentHash] Building transaction...");
  const transaction = new Transaction().add({
    keys: [],
    programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    data: Buffer.from(memo, "utf-8"),
  });

  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletPublicKey;

  // ✅ STEP 3: Simulate transaction BEFORE signing to catch errors early
  console.log("🔍 [anchorDocumentHash] Simulating transaction...", {
    feePayer: walletAddress,
    memo: memo.substring(0, 50) + "...",
    blockhash: blockhash.substring(0, 10) + "...",
  });
  
  const simulationResult = await conn.simulateTransaction(transaction);
  
  if (simulationResult.value.err) {
    console.error("❌ [anchorDocumentHash] Simulation failed:", {
      error: simulationResult.value.err,
      logs: simulationResult.value.logs,
    });
    const logs = simulationResult.value.logs?.join("\n") ?? "No logs available";
    throw new Error(
      `Transaction simulation failed: ${JSON.stringify(simulationResult.value.err)}\n\nTransaction Logs:\n${logs}\n\nPossible causes:\n- Insufficient SOL balance in wallet\n- Invalid memo format\n- Network connectivity issue`
    );
  }
  
  console.log("✅ [anchorDocumentHash] Simulation successful, proceeding with signing");

  // ✅ STEP 4: Now safe to sign and send
  try {
    console.log("🔐 [anchorDocumentHash] Requesting signature from Phantom wallet...");
    console.log("📋 [anchorDocumentHash] Transaction details:", {
      instructions: transaction.instructions.length,
      feePayer: walletPublicKey.toBase58().substring(0, 10) + "...",
      recentBlockhash: transaction.recentBlockhash?.substring(0, 10) + "...",
    });

    console.log("⏳ [anchorDocumentHash] Waiting for Phantom popup response...");
    
    // Phantom popup should appear here
    const signed = await signTransaction(transaction);
    
    console.log("✅ [anchorDocumentHash] Transaction signed successfully");
    console.log("📤 [anchorDocumentHash] Sending transaction to blockchain...");
    
    const signature = await conn.sendRawTransaction(signed.serialize());
    console.log("✅ [anchorDocumentHash] Transaction sent:", signature);
    
    await conn.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
    console.log("✅ [anchorDocumentHash] Transaction confirmed");

    const status = await conn.getSignatureStatus(signature);
    const slot = status.value?.slot ?? 0;

    return { signature, slot };
  } catch (signError: any) {
    console.error("❌ [anchorDocumentHash] Signing failed:", {
      errorName: signError?.name,
      errorMessage: signError?.message,
      errorCode: signError?.code,
      fullError: signError,
    });
    
    // Provide helpful error messages
    let userMessage = "Gagal menandatangani transaksi";
    
    if (signError?.message?.includes("Unexpected") || signError?.name === "WalletSignTransactionError") {
      userMessage = `❌ Phantom error saat signing. Coba:\n1. Close Phantom popup\n2. Refresh halaman (Ctrl+F5)\n3. Disconnect & Reconnect Phantom\n4. Coba anchor lagi\n\nJika masih error: Phantom extension mungkin bermasalah`;
    } else if (signError?.message?.includes("rejected")) {
      userMessage = "⛔ Anda menolak signing di Phantom popup";
    } else if (signError?.message?.includes("not ready")) {
      userMessage = "⏳ Phantom wallet belum ready. Coba refresh halaman";
    }
    
    throw new Error(userMessage);
  }
}

export async function verifyHashOnChain(
  signature: string,
  expectedHash: string,
): Promise<boolean> {
  const conn = getConnection();
  const tx = await conn.getTransaction(signature, { maxSupportedTransactionVersion: 0 });

  if (!tx) return false;

  const logs = tx.meta?.logMessages ?? [];
  return logs.some((log) => log.includes(expectedHash));
}

/** Anchor program interface stub — ready for IDL integration */
export interface HireLedgerAnchorProgram {
  anchorDocumentHash: (hash: string, contractId: string) => Promise<string>;
  verifyDocument: (hash: string) => Promise<boolean>;
}

export const anchorProgramStub: HireLedgerAnchorProgram = {
  anchorDocumentHash: async (hash, contractId) => {
    console.info("[Anchor stub] anchorDocumentHash", { hash, contractId });
    return `stub-signature-${Date.now()}`;
  },
  verifyDocument: async (hash) => {
    console.info("[Anchor stub] verifyDocument", { hash });
    return true;
  },
};
