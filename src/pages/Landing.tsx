import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  Fingerprint,
  Hash,
  Hexagon,
  Layers,
  LineChart,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Landing = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary blur-md opacity-60" />
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/5 p-1">
  <img
    src="/img/hireledger.png"
    alt="HireLedger Logo"
    className="h-full w-full object-contain"
  />
</div>
            </div>
            <span className="font-display text-lg font-bold">HireLedger</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
            <a href="#fitur" className="hover:text-foreground">Fitur</a>
            <a href="#workflow" className="hover:text-foreground">Workflow</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" className="rounded-xl">Masuk</Button></Link>
            <Link to="/register"><Button className="btn-ripple rounded-xl bg-gradient-primary text-primary-foreground">Mulai Gratis</Button></Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="cyber-lines absolute inset-0 opacity-20" />
        <div className="hex-pattern absolute inset-0 opacity-20" />
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/25 blur-[120px] animate-pulse" />
        <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-secondary/25 blur-[140px] animate-pulse" />
        <div className="blockchain-particles absolute inset-0" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">Platform SaaS Outsourcing Web3</span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Kelola Outsourcing & PKWT Lebih <span className="gradient-text">Aman, Cepat, Modern</span>
            </h1>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              HireLedger membantu perusahaan mengelola rekrutmen, kontrak PKWT, payroll, attendance, hingga verifikasi blockchain dalam satu platform enterprise SaaS.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/register">
                <Button className="btn-ripple h-12 w-full gap-2 rounded-xl bg-gradient-primary px-6 font-semibold text-primary-foreground sm:w-auto">
                  Coba 14 Hari Gratis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="h-12 w-full rounded-xl border-border/60 bg-muted/30 px-6 sm:w-auto">
                  Lihat Demo Dashboard
                </Button>
              </Link>
            </div>
            <div className="grid max-w-lg grid-cols-3 gap-4 pt-3">
              <MiniStat value="250+" label="Perusahaan" />
              <MiniStat value="12.8K" label="Karyawan Aktif" />
              <MiniStat value="Rp 184M" label="Payroll/Bulan" />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="glass-strong animate-slide-up relative rounded-3xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-lg font-semibold">Mini Dashboard</p>
                <span className="rounded-full border border-success/30 bg-success/15 px-2.5 py-1 text-[10px] font-semibold uppercase text-success">Live</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Card title="Kontrak Aktif" value="892" />
                <Card title="Payroll Bulan Ini" value="Rp 8.2M" />
                <Card title="Verifikasi Chain" value="1,104" />
                <Card title="Kontrak Jatuh Tempo" value="34" />
              </div>
              <div className="mt-4 rounded-xl border border-border/60 bg-background/50 p-3">
                <p className="text-xs text-muted-foreground">Transaksi terakhir</p>
                <p className="mt-1 font-mono text-xs">4a8f3c2b7e1d9f0a4c6b8e7d5a2c1b9</p>
              </div>
            </div>

            <div className="glass absolute -left-5 top-10 hidden rounded-2xl p-3 md:block">
              <div className="flex items-center gap-2 text-xs"><ShieldCheck className="h-4 w-4 text-success" /> Kontrak tervalidasi</div>
            </div>
            <div className="glass absolute -right-5 bottom-10 hidden rounded-2xl p-3 md:block">
              <div className="flex items-center gap-2 text-xs"><Wallet className="h-4 w-4 text-primary" /> Solana Devnet</div>
            </div>
            <div className="glass absolute left-10 top-[88%] hidden rounded-2xl p-3 md:block">
              <div className="flex items-center gap-2 text-xs"><Hash className="h-4 w-4 text-accent" /> Hash Validated</div>
            </div>
          </div>
        </div>
        <a href="#trusted" className="relative mb-3 flex justify-center text-muted-foreground">
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </a>
      </section>

      <section id="trusted" className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">Dipercaya oleh tim HR dan outsourcing modern</p>
        <div className="marquee mt-6">
          <div className="marquee-track">
            {["NusaTech Group", "Sinar Digital", "Hexa Industries", "Polaris Infra", "Astra Workforce", "Vertex Logistik", "ByteChain Labs"].map((x) => (
              <span key={x} className="mx-5 rounded-lg border border-border/60 bg-muted/20 px-4 py-2 text-sm">{x}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value="257" label="Total Perusahaan" />
          <Stat value="12.840" label="Total Employee" />
          <Stat value="18.420" label="Kontrak Verified" />
          <Stat value="Rp 184,2 M" label="Payroll Diproses" />
        </div>
      </section>

      <section id="fitur" className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <SectionHead title="Fitur Platform HireLedger" subtitle="Dirancang untuk workflow HR outsourcing enterprise dengan sentuhan Web3." />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Feature title="Recruitment Digital" desc="Pipeline kandidat terstruktur dari sourcing hingga onboarding." icon={<BriefcaseBusiness className="h-5 w-5 text-primary" />} />
          <Feature title="PKWT Automation" desc="Template kontrak otomatis, approval berlapis, dan audit-ready." icon={<FileCheck2 className="h-5 w-5 text-success" />} />
          <Feature title="Payroll Management" desc="Payroll bulanan, komponen gaji, dan integrasi lembur." icon={<Building2 className="h-5 w-5 text-accent" />} />
          <Feature title="Blockchain Verification" desc="Validasi hash kontrak di Solana Devnet dengan status transaksi." icon={<ShieldCheck className="h-5 w-5 text-secondary" />} />
          <Feature title="Multi Tenant Workspace" desc="Data perusahaan terisolasi, aman, dan siap skala." icon={<Layers className="h-5 w-5 text-primary" />} />
          <Feature title="Smart Analytics" desc="Insight kontrak, employee growth, serta forecast biaya." icon={<LineChart className="h-5 w-5 text-warning" />} />
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <SectionHead title="Workflow System" subtitle="Alur outsourcing modern dari awal rekrutmen hingga bukti verifikasi blockchain." />
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {["Recruitment", "Approval", "PKWT", "Payroll", "Blockchain Verification"].map((step, idx) => (
            <div key={step} className="relative rounded-2xl border border-border/60 bg-gradient-card p-4">
              <p className="mb-2 text-[11px] uppercase tracking-widest text-primary">Step {idx + 1}</p>
              <p className="font-semibold">{step}</p>
              {idx !== 4 && <span className="absolute -right-2 top-1/2 hidden h-[2px] w-4 bg-primary md:block" />}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <SectionHead title="Blockchain Assurance Layer" subtitle="Semua dokumen kontrak memiliki jejak digital yang immutable, transparan, dan dapat diverifikasi." />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Feature title="Smart Contract Verification" desc="Kontrak tervalidasi sebelum deployment untuk menekan risiko." icon={<CheckCircle2 className="h-5 w-5 text-success" />} />
          <Feature title="Hash Validation" desc="Setiap perubahan dokumen menghasilkan hash unik yang bisa dilacak." icon={<Hash className="h-5 w-5 text-accent" />} />
          <Feature title="Immutable Document" desc="Dokumen tidak dapat diubah secara sepihak setelah anchored." icon={<Fingerprint className="h-5 w-5 text-primary" />} />
          <Feature title="Wallet Integration" desc="Integrasi wallet untuk approval signature dan otorisasi deploy." icon={<Wallet className="h-5 w-5 text-secondary" />} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <SectionHead title="Preview Dashboard Modern" subtitle="Tampilan ringkas analytics, payroll, dan aktivitas blockchain dalam satu workspace." />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Card title="Payroll Trend" value="Naik 12.8% QoQ" />
          <Card title="Employee Growth" value="+1.248 aktif" />
          <Card title="Blockchain Activity" value="142 Tx / Minggu" />
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <SectionHead title="Pricing Plans" subtitle="Pilih paket sesuai skala operasional perusahaan Anda." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Price name="Starter" price="Rp 1,5jt" desc="Untuk tim kecil yang mulai digitalisasi HR." />
          <Price featured name="Professional" price="Rp 3,5jt" desc="Untuk perusahaan berkembang dengan kebutuhan automation." />
          <Price name="Enterprise" price="Custom" desc="Untuk skala besar dengan kebutuhan integrasi lanjutan." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <SectionHead title="Testimonial" subtitle="Apa kata tim yang sudah menggunakan HireLedger." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            "Proses kontrak PKWT jadi jauh lebih cepat dan audit-ready.",
            "Tim finance terbantu karena payroll lebih rapi dan terukur.",
            "Verifikasi blockchain bikin proses legal lebih transparan.",
          ].map((text, i) => (
            <div key={text} className="glass rounded-2xl p-5">
              <p className="text-sm text-muted-foreground">"{text}"</p>
              <p className="mt-3 text-sm font-semibold">User {i + 1} · HR Lead</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-5xl px-4 py-16 md:px-6 lg:px-8">
        <SectionHead title="FAQ" subtitle="Pertanyaan yang paling sering ditanyakan." />
        <div className="mt-8 space-y-3">
          <Faq q="Apakah HireLedger mendukung multi-tenant?" a="Ya, setiap perusahaan memiliki workspace dan data terisolasi." />
          <Faq q="Apakah sudah siap untuk integrasi Supabase?" a="Struktur frontend sudah disiapkan untuk integrasi backend Supabase pada fase berikutnya." />
          <Faq q="Apakah kontrak bisa diverifikasi di blockchain?" a="Bisa, melalui hash validation dan explorer activity untuk setiap transaksi kontrak." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-card p-8 text-center md:p-12">
          <div className="absolute inset-0 grid-bg opacity-25" />
          <div className="relative">
            <p className="text-sm uppercase tracking-[0.2em] text-primary">Siap mulai transformasi HR outsourcing?</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Bangun Operasional Outsourcing Modern bersama HireLedger</h2>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/register"><Button className="btn-ripple h-11 rounded-xl bg-gradient-primary text-primary-foreground">Mulai Sekarang <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/login"><Button variant="outline" className="h-11 rounded-xl">Masuk Dashboard</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-4 md:px-6 lg:px-8">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary"><Hexagon className="h-4 w-4 text-primary-foreground" /></div>
              <span className="font-display font-bold">HireLedger</span>
            </div>
            <p className="text-sm text-muted-foreground">Enterprise SaaS + Web3 untuk HR Outsourcing Platform.</p>
          </div>
          <FooterCol title="Produk" items={["Recruitment", "Contracts PKWT", "Payroll", "Blockchain"]} />
          <FooterCol title="Perusahaan" items={["Tentang Kami", "Karir", "Partner", "Kontak"]} />
          <FooterCol title="Legal" items={["Kebijakan Privasi", "Syarat Layanan", "Keamanan", "Audit"]} />
        </div>
      </footer>
    </div>
  );
};

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
      <p className="font-display text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Feature({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="font-display text-2xl font-bold md:text-3xl">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="font-display text-3xl font-bold md:text-4xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground md:text-base">{subtitle}</p>
    </div>
  );
}

function Price({ name, price, desc, featured }: { name: string; price: string; desc: string; featured?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 ${featured ? "border-primary/60 bg-primary/10" : "border-border/60 bg-gradient-card"}`}>
      {featured && <span className="mb-2 inline-flex rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">Most Popular</span>}
      <h3 className="font-display text-2xl font-bold">{name}</h3>
      <p className="mt-1 text-2xl font-semibold">{price}<span className="ml-1 text-sm font-normal text-muted-foreground">/ bulan</span></p>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <Button className="mt-5 w-full rounded-xl bg-gradient-primary text-primary-foreground">Pilih Paket</Button>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="font-semibold">{q}</p>
      <p className="mt-1 text-sm text-muted-foreground">{a}</p>
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

export default Landing;
