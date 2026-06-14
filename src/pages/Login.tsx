import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      toast.success("Login berhasil", { description: "Selamat datang di HireLedger." });
      const redirectPath = (location.state as { from?: string } | null)?.from || "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login gagal";
      toast.error("Login gagal", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute -left-40 top-10 h-80 w-80 rounded-full bg-primary/25 blur-[120px]" />
      <form onSubmit={handleSubmit} className="glass-strong z-10 w-full max-w-md space-y-5 rounded-3xl p-6 md:p-8">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <Home className="h-3.5 w-3.5" /> Kembali ke Home
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Masuk ke Dashboard</h1>
          <p className="text-sm text-muted-foreground">Kelola outsourcing, PKWT, payroll, dan verifikasi Solana.</p>
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@perusahaan.id" type="email" required />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <div className="relative">
            <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pr-10" required />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          Ingat saya di perangkat ini
        </label>
        <Button type="submit" className="h-11 w-full gap-2 rounded-xl bg-gradient-primary" disabled={loading}>
          <LogIn className="h-4 w-4" /> {loading ? "Memproses login..." : "Masuk"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Belum punya tenant? <Link to="/register" className="font-semibold text-primary hover:underline">Daftar sekarang</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
