import { notFound, redirect } from "next/navigation";
import { findCustomerById, findOrder } from "@/lib/server/repo";
import { upsellFor, rupiah, PACKAGES } from "@/lib/pricing";
import { IconCheck } from "@/components/icons";
import UpsellButton from "@/components/UpsellButton";

export const dynamic = "force-dynamic";

export default async function Sukses({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await findOrder(code);
  if (!order) notFound();
  if (order.status !== "paid") redirect(`/bayar/${code}`);
  const c = await findCustomerById(order.customer_id);
  if (!c) notFound();
  const up = upsellFor(c.package);
  const link = `/m/${c.access_token}`;

  return (
    <main className="flex min-h-dvh flex-col px-6 pb-8 pt-12">
      <div className="text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-teal-500 text-white shadow-[var(--shadow-lift)]">
          <IconCheck className="h-12 w-12" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Pembayaran berhasil!</h1>
        <p className="mt-2 text-sm text-muted">
          Menu 30 hari {c.child_name} sudah siap ({PACKAGES[c.package].name}). Link akses juga dikirim ke WhatsApp {maskWa(c.wa)}.
        </p>
      </div>

      {up && (
        <section className="mt-8 rounded-[28px] border-2 border-dashed border-orange-400 bg-orange-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Penawaran sekali ini</p>
          <p className="mt-1 text-lg font-bold">{up.title}</p>
          <p className="mt-1 text-sm text-muted">{up.desc}</p>
          <p className="mt-3 text-sm">
            Cukup tambah <b className="text-orange-600">{rupiah(up.price)}</b>
          </p>
          <UpsellButton token={c.access_token} label={`Ya, tambahkan · ${rupiah(up.price)}`} />
        </section>
      )}

      <a href={link} className="mt-auto block w-full rounded-full bg-teal-500 py-4 text-center font-semibold text-white shadow-[var(--shadow-lift)]">
        {up ? "Tidak, terima kasih — buka menu" : "Buka menu sekarang"}
      </a>
    </main>
  );
}

function maskWa(wa: string) {
  return wa.slice(0, 4) + "••••" + wa.slice(-3);
}
