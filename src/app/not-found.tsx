import Link from "next/link";
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <p className="text-5xl">🥣</p>
      <h1 className="mt-4 text-xl font-bold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-muted">Link mungkin salah ketik. Cek kembali link dari WhatsApp.</p>
      <Link href="/" className="mt-6 rounded-full bg-teal-500 px-6 py-3 font-semibold text-white">Ke beranda</Link>
    </main>
  );
}
