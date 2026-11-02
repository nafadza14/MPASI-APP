import { notFound, redirect } from "next/navigation";
import { findCustomerById, findOrder } from "@/lib/server/repo";
import { upsellFor, rupiah, PACKAGES } from "@/lib/pricing";
import SuccessView from "./SuccessView";

export const dynamic = "force-dynamic";

export default async function Sukses({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await findOrder(code);
  if (!order) notFound();
  if (order.status !== "paid") redirect(`/bayar/${code}`);
  const c = await findCustomerById(order.customer_id);
  if (!c) notFound();
  const up = upsellFor(c.package);
  return (
    <SuccessView
      token={c.access_token}
      name={c.child_name}
      pkgName={PACKAGES[c.package].name}
      wa={c.wa.slice(0, 4) + "••••" + c.wa.slice(-3)}
      upsell={up ? { title: up.title, desc: up.desc, price: rupiah(up.price) } : null}
    />
  );
}
