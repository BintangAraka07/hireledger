import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const txs = [
  { hash: "0x4a8f3c2b7e1d9f0a4c6b8e7d5a2c1b91", kontrak: "PKWT-0241", status: "Confirmed" },
  { hash: "0x7b21d4f8c0a3e5b9d7f2a8c4e1b69d44", kontrak: "PKWT-0240", status: "Confirmed" },
  { hash: "0xc3e9a1b4d8f2c0e7a5b3d9f1c8e21f08", kontrak: "PKWT-0239", status: "Pending" },
];

export default function Explorer() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 md:p-6 lg:p-8">
        <PageHeader eyebrow="On-Chain" title={<>Blockchain <span className="gradient-text">Explorer</span></>} description="Lihat transaksi kontrak PKWT dan status verifikasi chain tenant Anda." />
        <Card className="border-border/60 bg-gradient-card">
          <CardHeader><CardTitle className="text-base">Solana Transaction Feed</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {txs.map((tx) => (
              <div key={tx.hash} className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-xs">{tx.hash.slice(0, 16)}...{tx.hash.slice(-8)}</p>
                  <p className="text-xs text-muted-foreground">{tx.kontrak} · {tx.status}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg">
                  Buka Explorer <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
