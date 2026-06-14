import { Bell, ChevronDown, LogOut, Search, Settings as SettingsIcon, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { ROLE_LABELS } from "@/types";
import { useDashboardStats } from "@/hooks/use-dashboard";

export function TopBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: stats } = useDashboardStats(user?.companyId);

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "HL";

  const handleLogout = async () => {
    await logout();
    toast("Logged out", { description: "Sesi Anda telah diakhiri." });
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Cari karyawan, kontrak, hash..." className="h-10 rounded-xl border-border/60 bg-muted/40 pl-10" />
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <WalletConnectButton className="hidden sm:flex" />

        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
          <Bell className="h-[18px] w-[18px]" />
          {(stats?.pendingApprovals ?? 0) > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 h-5 min-w-5 rounded-full border-2 border-background bg-gradient-primary p-0 text-[10px]">
              {stats?.pendingApprovals}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 py-1 pl-1 pr-2 md:pr-3">
              <Avatar className="h-8 w-8 ring-2 ring-primary/40">
                <AvatarImage src={user?.avatarUrl ?? ""} />
                <AvatarFallback className="bg-gradient-primary text-xs font-bold text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col leading-tight md:flex">
                <span className="text-xs font-semibold">{user?.fullName}</span>
                <span className="text-[10px] text-muted-foreground">{user?.companyName}</span>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl">
            <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-gradient-primary text-sm font-bold text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <span className="truncate text-sm font-semibold">{user?.fullName}</span>
                <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
                <span className="mt-1 inline-flex rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-primary">
                  {user?.role ? ROLE_LABELS[user.role] : "User"}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}><SettingsIcon className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive"><LogOut className="mr-2 h-4 w-4" /> Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
