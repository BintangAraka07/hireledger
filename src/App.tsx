import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { clusterApiUrl } from "@solana/web3.js";
import { SOLANA_NETWORK, SOLANA_RPC_URL } from "@/lib/constants";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing.tsx";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Recruitment from "./pages/Recruitment.tsx";
import Employees from "./pages/Employees.tsx";
import Contracts from "./pages/Contracts.tsx";
import Payroll from "./pages/Payroll.tsx";
import Attendance from "./pages/Attendance.tsx";
import Reports from "./pages/Reports.tsx";
import Blockchain from "./pages/Blockchain.tsx";
import Explorer from "./pages/Explorer.tsx";
import Subscription from "./pages/Subscription.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";

import "@solana/wallet-adapter-react-ui/styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const endpoint =
    SOLANA_RPC_URL ||
    clusterApiUrl(SOLANA_NETWORK as "devnet" | "mainnet-beta" | "testnet");
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/recruitment" element={<ProtectedRoute permission="recruitment"><Recruitment /></ProtectedRoute>} />
                <Route path="/employees" element={<ProtectedRoute permission="employees"><Employees /></ProtectedRoute>} />
                <Route path="/contracts" element={<ProtectedRoute permission="contracts"><Contracts /></ProtectedRoute>} />
                <Route path="/payroll" element={<ProtectedRoute permission="payroll"><Payroll /></ProtectedRoute>} />
                <Route path="/attendance" element={<ProtectedRoute permission="attendance"><Attendance /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute permission="reports"><Reports /></ProtectedRoute>} />
                <Route path="/blockchain" element={<ProtectedRoute permission="blockchain"><Blockchain /></ProtectedRoute>} />
                <Route path="/explorer" element={<ProtectedRoute permission="blockchain"><Explorer /></ProtectedRoute>} />
                <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute permission="settings"><Settings /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
