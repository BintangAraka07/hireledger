export const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK || "devnet";
export const SOLANA_RPC_URL =
  import.meta.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com";

export const SOLANA_EXPLORER_BASE =
  SOLANA_NETWORK === "mainnet-beta"
    ? "https://explorer.solana.com"
    : `https://explorer.solana.com?cluster=${SOLANA_NETWORK}`;

export const REMEMBER_ME_KEY = "hireledger.remember";
export const WALLET_STORAGE_KEY = "hireledger.wallet";

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_legal: "Menunggu Legal",
  pending_hr: "Menunggu HR",
  active: "Aktif",
  completed: "Selesai",
  expired: "Kedaluwarsa",
  rejected: "Ditolak",
};

export const MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];
