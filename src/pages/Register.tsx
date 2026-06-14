import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff, Home, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [nama, setNama] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }
    setLoading(true);
    try {
      await register({ nama, email, password, tenantName });
      toast.success("Tenant berhasil dibuat", { description: "Akun perusahaan Anda siap digunakan." });
      navigate("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Pendaftaran gagal";
      toast.error("Pendaftaran gagal", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute -right-40 bottom-10 h-80 w-80 rounded-full bg-secondary/25 blur-[120px]" />
      <form onSubmit={handleSubmit} className="glass-strong z-10 w-full max-w-xl space-y-5 rounded-3xl p-6 md:p-8">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <Home className="h-3.5 w-3.5" /> Kembali ke Home
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Buat Workspace Tenant</h1>
          <p className="text-sm text-muted-foreground">Registrasi SaaS multi-tenant outsourcing berbasis Solana Devnet.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Nama Lengkap</Label>
            <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama admin tenant" required />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" />Nama Perusahaan</Label>
            <Input value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="PT Outsource Nusantara" required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="admin@perusahaan.id" required />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 8 karakter" className="pr-10" required minLength={8} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        <Button type="submit" className="h-11 w-full gap-2 rounded-xl bg-gradient-primary" disabled={loading}>
          <UserPlus className="h-4 w-4" /> {loading ? "Mendaftarkan tenant..." : "Buat Tenant & Masuk"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun? <Link to="/login" className="font-semibold text-primary hover:underline">Masuk di sini</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
