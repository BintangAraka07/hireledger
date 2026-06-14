import { Wallet, LogOut, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { truncateHash } from "@/lib/hash";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { updateWalletAddress } from "@/services/auth.service";

interface WalletConnectButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showBalance?: boolean;
}

export function WalletConnectButton({
  variant = "outline",
  size = "sm",
  className,
  showBalance = false,
}: WalletConnectButtonProps) {
  const { publicKey, connecting, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { user, refreshProfile } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("🔌 [WalletConnectButton] Wallet state:", {
      connected,
      connecting,
      publicKey: publicKey?.toBase58() ?? null,
      hasPhantom: !!window.phantom?.solana,
    });
  }, [connected, connecting, publicKey]);

  const handleConnect = async () => {
    try {
      console.log("🔐 [WalletConnectButton] Opening Phantom connection modal");
      setVisible(true);
      // Note: We open the modal but don't show success yet
      // Success will show when publicKey updates (see useEffect below)
    } catch (err) {
      console.error("❌ [WalletConnectButton] Failed to open modal:", err);
      toast.error("Gagal menghubungkan wallet", { description: "Pastikan Phantom Wallet terinstall." });
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log("🔌 [WalletConnectButton] Disconnecting wallet");
      await disconnect();
      if (user?.id) {
        await updateWalletAddress(user.id, null);
        await refreshProfile();
      }
      toast("Wallet terputus");
    } catch (err) {
      console.error("❌ [WalletConnectButton] Failed to disconnect:", err);
      toast.error("Gagal memutuskan wallet");
    }
  };

  useEffect(() => {
    if (publicKey && user?.id) {
      const addr = publicKey.toBase58();
      console.log("✅ [WalletConnectButton] Wallet connected:", addr);
      if (user.walletAddress !== addr) {
        void updateWalletAddress(user.id, addr).then(refreshProfile);
      }
    }
  }, [publicKey, user?.id, user?.walletAddress, refreshProfile]);

  if (publicKey) {
    return (
      <div className="flex items-center gap-2">
        {showBalance && (
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {balanceLoading ? "..." : `${(balance ?? 0).toFixed(4)} SOL`}
          </span>
        )}
        <Button variant={variant} size={size} className={className} onClick={handleDisconnect}>
          <span className="mr-2 h-2 w-2 rounded-full bg-success animate-pulse-glow" />
          <Wallet className="mr-1.5 h-3.5 w-3.5" />
          {truncateHash(publicKey.toBase58(), 4, 4)}
          <LogOut className="ml-1.5 h-3 w-3 opacity-60" />
        </Button>
      </div>
    );
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleConnect} disabled={connecting}>
      {connecting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="mr-2 h-4 w-4" />
      )}
      {connecting ? "Menghubungkan..." : "Connect Phantom"}
    </Button>
  );
}
