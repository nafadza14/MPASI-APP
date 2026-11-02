"use client";
import { useState } from "react";
import { Button } from "@/components/ui";
import { cookie, track } from "@/lib/client";

export default function UpsellButton({ token, label, type = "upgrade", variant = "orange" }: { token: string; label: string; type?: "upgrade" | "renewal"; variant?: "orange" | "primary" }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  async function go() {
    setLoading(true);
    setErr("");
    track("InitiateCheckout", { content_name: type });
    const r = await fetch("/api/upsell", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, type, fbp: cookie("_fbp"), fbc: cookie("_fbc") }) });
    const j = await r.json();
    if (!r.ok) {
      setErr(j.error || "Gagal");
      setLoading(false);
      return;
    }
    window.location.href = j.url;
  }
  return (
    <>
      <Button variant={variant} className="mt-4" onClick={go} disabled={loading}>
        {loading ? "Membuat QRIS…" : label}
      </Button>
      {err && <p className="mt-2 text-sm text-orange-700">{err}</p>}
    </>
  );
}
