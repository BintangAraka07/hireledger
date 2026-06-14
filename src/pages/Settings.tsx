import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Wallet, Bell, Shield, Save, Users, Trash2, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { inviteUser, getCompanyUsers, deleteUser } from "@/services/auth.service";
import { toast } from "@/components/ui/sonner";
import type { UserRole } from "@/types";

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof User;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-6 backdrop-blur-xl">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-gradient-to-br from-primary/20 to-primary/0 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ label, description, defaultChecked }: { label: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/40 py-3 last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

const Settings = () => {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"hr" | "legal" | "finance" | "employee">("hr");
  const [inviting, setInviting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Load company users
  useEffect(() => {
    if (!user?.companyId) return;

    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const data = await getCompanyUsers(user.companyId);
        setUsers(data || []);
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    void loadUsers();
  }, [user?.companyId]);

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteName || !user?.companyId) {
      toast.error("Lengkapi semua field");
      return;
    }

    setInviting(true);
    try {
      await inviteUser({
        email: inviteEmail,
        fullName: inviteName,
        role: inviteRole,
        companyId: user.companyId,
      });

      toast.success("User berhasil diundang!", {
        description: `Email verifikasi telah dikirim ke ${inviteEmail}`,
      });

      setInviteEmail("");
      setInviteName("");
      setInviteRole("hr");

      // Reload users list
      const data = await getCompanyUsers(user.companyId);
      setUsers(data || []);
    } catch (err) {
      console.error("Error inviting user:", err);
      toast.error(err instanceof Error ? err.message : "Gagal mengundang user");
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;

    try {
      await deleteUser(userId);
      toast.success("User berhasil dihapus");

      if (user?.companyId) {
        const data = await getCompanyUsers(user.companyId);
        setUsers(data || []);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus user");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1200px] space-y-6 p-4 md:p-6 lg:p-8">
        <PageHeader
          eyebrow="Workspace"
          title={<><span className="gradient-text">Settings</span></>}
          description="Manage your profile, wallet, notifications, and system configuration."
          actions={
            <Button className="h-11 gap-2 rounded-xl bg-gradient-primary font-semibold text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.7)] hover:shadow-[0_12px_32px_-8px_hsl(var(--primary)/0.9)]">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          }
        />

        <SectionCard icon={User} title="User Profile" description="Public information and account details">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-lg font-bold text-primary-foreground">
              AS
            </div>
            <div>
              <p className="font-display text-base font-semibold">Bintang Araka</p>
              <p className="text-xs text-muted-foreground">{user?.tenantName || "HireLedger Tech"} · Admin Tenant</p>
              <Button variant="outline" size="sm" className="mt-2 h-8 rounded-lg border-border/60 bg-muted/30 text-xs hover:bg-muted/60">
                Change avatar
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Full name</Label>
              <Input defaultValue="Bintang Araka" className="h-11 rounded-xl border-border/60 bg-muted/30" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input defaultValue={user?.email || "admin@hireledger.io"} className="h-11 rounded-xl border-border/60 bg-muted/30" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Role</Label>
              <Input defaultValue="Admin" disabled className="h-11 rounded-xl border-border/60 bg-muted/30 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Timezone</Label>
              <Select defaultValue="wib">
                <SelectTrigger className="h-11 rounded-xl border-border/60 bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wib">Asia/Jakarta (WIB)</SelectItem>
                  <SelectItem value="wita">Asia/Makassar (WITA)</SelectItem>
                  <SelectItem value="wit">Asia/Jayapura (WIT)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard icon={Wallet} title="Wallet & Network" description="Solana Devnet configuration">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Connected wallet</Label>
                <Input defaultValue="Solana wallet address" disabled className="h-11 rounded-xl border-border/60 bg-muted/30 font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Network</Label>
                <Input defaultValue="Solana Devnet" disabled className="h-11 rounded-xl border-border/60 bg-muted/30 font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">RPC Endpoint</Label>
                <Input defaultValue="https://api.devnet.solana.com" disabled className="h-11 rounded-xl border-border/60 bg-muted/30 font-mono text-xs text-[10px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Explorer</Label>
                <Input defaultValue="https://explorer.solana.com" disabled className="h-11 rounded-xl border-border/60 bg-muted/30 font-mono text-xs text-[10px]" />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={Bell} title="Notifications" description="Email and in-app alerts">
            <ToggleRow label="Contract expiry alerts" description="Notify 30, 14, and 7 days before expiry" defaultChecked />
            <ToggleRow label="Deployment confirmations" description="When a contract is anchored on-chain" defaultChecked />
            <ToggleRow label="Failed transactions" description="Alert on any failed deployment" defaultChecked />
            <ToggleRow label="Weekly digest" description="Summary every Monday morning" />
          </SectionCard>
        </div>

        <SectionCard icon={Shield} title="Security & System" description="Account safety and platform behavior">
          <ToggleRow label="Two-factor authentication" description="Require TOTP for sign-in" defaultChecked />
          <ToggleRow label="Require wallet signature for deploys" description="Manually sign every contract deployment" defaultChecked />
          <ToggleRow label="Audit log" description="Record all admin actions" defaultChecked />
          <ToggleRow label="Beta features" description="Opt-in to experimental capabilities" />
        </SectionCard>
        <SectionCard icon={Shield} title="Integrasi Data (Roadmap)" description="Persiapan integrasi backend production">
          <ToggleRow label="Mode Mock Session" description="Gunakan mock auth untuk development lokal" defaultChecked />
          <ToggleRow label="Supabase Ready Schema" description="Aktifkan struktur tenant untuk integrasi Supabase" defaultChecked />
          <ToggleRow label="API Versioning v1" description="Gunakan namespace API untuk skalabilitas" defaultChecked />
        </SectionCard>

        <SectionCard icon={Users} title="User Management" description="Kelola anggota tim dan assign roles">
          <div className="space-y-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-11 gap-2 rounded-xl bg-gradient-primary">
                  <Mail className="h-4 w-4" /> Undang User Baru
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Undang User Baru</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="hr@perusahaan.id"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="h-11 rounded-xl border-border/60 bg-muted/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input
                      placeholder="Nama HR Staff"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="h-11 rounded-xl border-border/60 bg-muted/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                      <SelectTrigger className="h-11 rounded-xl border-border/60 bg-muted/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr">HR Staff</SelectItem>
                        <SelectItem value="legal">Legal Staff</SelectItem>
                        <SelectItem value="finance">Finance Staff</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleInviteUser}
                    disabled={inviting}
                    className="h-11 w-full gap-2 rounded-xl bg-gradient-primary"
                  >
                    {inviting ? "Mengirim undangan..." : "Kirim Undangan"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="space-y-3 border-t border-border/60 pt-6">
              <h4 className="font-medium text-sm">User Perusahaan</h4>
              {loadingUsers ? (
                <p className="text-sm text-muted-foreground">Memuat data user...</p>
              ) : users.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada user. Mulai dengan mengundang HR dan Legal staff.</p>
              ) : (
                <div className="space-y-2">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
                      <div>
                        <p className="text-sm font-medium">{u.full_name}</p>
                        <p className="text-xs text-muted-foreground">{u.email} · {u.role}</p>
                      </div>
                      {u.id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-destructive hover:bg-destructive/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
};

export default Settings;
