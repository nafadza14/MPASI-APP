import type { Metadata } from "next";

// Halaman pribadi/transaksi: jangan diindeks mesin pencari.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
