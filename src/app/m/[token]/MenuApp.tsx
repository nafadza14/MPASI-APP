"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Avatar, Card, FoodBubble } from "@/components/ui";
import { IconCart, IconCheck, IconHeart, IconHome, IconLock, IconPrint, IconSwap, IconUser } from "@/components/icons";
import { MealCard, PrepBanner } from "@/components/MealCard";
import UpsellButton from "@/components/UpsellButton";
import { ageLabel, shoppingList, todayJakarta, WEEKS } from "@/lib/generator";
import { features, PACKAGES, RENEWAL_PRICE, rupiah, upsellFor } from "@/lib/pricing";
import { RECIPE_MAP } from "@/lib/recipes";
import { store } from "@/lib/client";
import type { Allergen, PackageId, Plan } from "@/lib/types";

type Tab = "menu" | "belanja" | "favorit" | "profil";

export default function MenuApp(props: {
  token: string;
  name: string;
  dob: string;
  pkg: PackageId;
  plans: Plan[];
  favorites: string[];
  swapsLeft: number;
  snackPlus: boolean;
  allergies: Allergen[];
}) {
  const { token, name, dob, pkg } = props;
  const f = features(pkg, props.plans.length);
  const [plans, setPlans] = useState(props.plans);
  const [favs, setFavs] = useState(props.favorites);
  const [swapsLeft, setSwapsLeft] = useState(props.swapsLeft);
  const [tab, setTab] = useState<Tab>("menu");
  const today = todayJakarta();

  const initial = useMemo(() => {
    for (let m = 0; m < plans.length; m++) {
      const idx = plans[m].days.findIndex((d) => d.date === today);
      if (idx >= 0) return { month: m, day: idx };
    }
    return { month: 0, day: 0 };
  }, [plans, today]);
  const [month, setMonth] = useState(initial.month);
  const [dayIdx, setDayIdx] = useState(initial.day);

  useEffect(() => {
    store.setToken(token);
    const t = new URLSearchParams(location.search).get("tab") as Tab | null;
    if (t) setTab(t);
  }, [token]);

  const plan = plans[month];
  const day = plan.days[dayIdx];

  return (
    <main className="pb-28">
      {tab === "menu" && (
        <MenuTab
          {...{ token, name, dob, plan, plans, month, setMonth, dayIdx, setDayIdx, swapsLeft, f }}
          onSwap={async (mealIndex) => {
            const r = await fetch("/api/swap", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, month: month + 1, day: day.day, meal: mealIndex }) });
            const j = await r.json();
            if (!r.ok) return alert(j.error);
            setPlans((ps) => {
              const next = structuredClone(ps);
              next[month].days[dayIdx].meals[mealIndex].recipeId = j.recipeId;
              next[month].days[dayIdx].meals[mealIndex].newAllergen = null;
              return next;
            });
            setSwapsLeft(j.swapsLeft);
          }}
        />
      )}
      {tab === "belanja" && <ShopTab token={token} plan={plan} locked={!f.shopping} pkg={pkg} />}
      {tab === "favorit" && <FavTab token={token} favs={favs} setFavs={setFavs} locked={!f.favorites} pkg={pkg} />}
      {tab === "profil" && <ProfileTab {...props} plans={plans} swapsLeft={swapsLeft} month={month} />}

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[440px] justify-around border-t border-line bg-white px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
        {(
          [
            ["menu", "Menu", IconHome],
            ["belanja", "Belanja", IconCart],
            ["favorit", "Favorit", IconHeart],
            ["profil", "Profil", IconUser],
          ] as const
        ).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] ${tab === id ? "font-semibold text-teal-600" : "text-muted"}`}>
            <Icon className="h-6 w-6" />
            {label}
          </button>
        ))}
      </nav>
    </main>
  );
}

function MenuTab(p: {
  token: string;
  name: string;
  dob: string;
  plan: Plan;
  plans: Plan[];
  month: number;
  setMonth: (m: number) => void;
  dayIdx: number;
  setDayIdx: (d: number) => void;
  swapsLeft: number;
  f: ReturnType<typeof features>;
  onSwap: (mealIndex: number) => Promise<void>;
}) {
  const { token, name, dob, plan, plans, month, setMonth, dayIdx, setDayIdx, swapsLeft, f } = p;
  const day = plan.days[dayIdx];
  const strip = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    const el = strip.current?.querySelector<HTMLElement>(`[data-day="${dayIdx}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [dayIdx, month]);

  return (
    <>
      <header className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{name}</p>
            <p className="text-xs text-muted">{ageLabel(dob, day.date)}</p>
          </div>
          <Avatar name={name} />
        </div>

        {plans.length > 1 && (
          <div className="mt-4 flex gap-2">
            {plans.map((_, m) => (
              <button key={m} onClick={() => { setMonth(m); setDayIdx(0); }} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${m === month ? "bg-teal-500 text-white" : "bg-teal-50 text-teal-700"}`}>
                Bulan {m + 1}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-end justify-between">
          <div ref={strip} className="no-scrollbar -mx-5 flex flex-1 items-end gap-5 overflow-x-auto px-[45%]">
            {plan.days.map((d, k) => {
              const dist = Math.abs(k - dayIdx);
              return (
                <button
                  key={d.day}
                  data-day={k}
                  onClick={() => setDayIdx(k)}
                  className={`shrink-0 font-semibold leading-none transition ${dist === 0 ? "text-5xl text-teal-500" : dist === 1 ? "text-2xl text-teal-400/70" : "text-xl text-teal-100"}`}
                  aria-label={`Hari ${d.day}`}
                >
                  {d.day}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted">{new Date(day.date + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</span>
          <span className="font-semibold text-teal-600">Hari</span>
        </div>
      </header>

      <section className="mt-5 px-5">
        <div className="no-scrollbar flex gap-3 overflow-x-auto">
          <QuickTile emoji="📋" label="Menu" active />
          <QuickTile emoji="🧊" label={day.prepDay ? "Hari masak" : "Simpan"} />
          <QuickTile emoji="🥣" label={["", "Pure & lumat", "Cincang", "Keluarga"][day.stage]} />
          <QuickTile emoji="🔁" label={f.swaps ? `${swapsLeft}x ganti` : "Ganti menu"} />
        </div>
      </section>

      <section className="mt-6 px-5">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-lg font-semibold">Menu hari {day.day}</p>
          {f.swaps > 0 && <p className="text-xs text-muted">Sisa ganti menu: {swapsLeft}</p>}
        </div>
        {day.textureUp && <p className="mb-3 rounded-2xl bg-teal-500 px-4 py-3 text-sm font-medium text-white">⬆️ Mulai hari ini tekstur naik tahap. Lihat catatan tekstur di setiap resep.</p>}
        {day.prepDay && f.mealprep && <PrepBanner />}
        <div className="space-y-3">
          {day.meals.map((m, k) => (
            <MealCard
              key={k + m.recipeId}
              meal={m}
              stage={day.stage}
              expandable={false}
              href={`/m/${token}/resep/${m.recipeId}?b=${month + 1}&d=${day.day}`}
              action={
                f.swaps > 0 && !m.newAllergen ? (
                  <button
                    disabled={busy !== null || swapsLeft <= 0}
                    onClick={async () => {
                      setBusy(k);
                      await p.onSwap(k);
                      setBusy(null);
                    }}
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-teal-600 disabled:text-muted"
                  >
                    <IconSwap /> {busy === k ? "Mengganti…" : "Ganti menu ini"}
                  </button>
                ) : null
              }
            />
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">Tetap lanjutkan ASI. Ikuti tanda lapar dan kenyang. Panduan edukasi, bukan pengganti dokter.</p>
      </section>
    </>
  );
}

function QuickTile({ emoji, label, active = false }: { emoji: string; label: string; active?: boolean }) {
  return (
    <div className={`flex w-[84px] shrink-0 flex-col items-center gap-1.5 rounded-2xl p-3 ${active ? "bg-orange-50" : "bg-teal-50"}`}>
      <span className="text-2xl">{emoji}</span>
      <span className="text-center text-[11px] font-medium leading-tight">{label}</span>
    </div>
  );
}

function Locked({ token, pkg, what }: { token: string; pkg: PackageId; what: string }) {
  const up = upsellFor(pkg);
  return (
    <div className="mx-5 mt-6 rounded-[28px] bg-teal-50 p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-teal-600">
        <IconLock className="h-6 w-6" />
      </div>
      <p className="mt-3 font-semibold">{what} ada di paket Lengkap</p>
      {up && <p className="mt-1 text-sm text-muted">{up.desc}</p>}
      {up && <UpsellButton token={token} label={`Buka sekarang · ${rupiah(up.price)}`} variant="primary" />}
    </div>
  );
}

function ShopTab({ token, plan, locked, pkg }: { token: string; plan: Plan; locked: boolean; pkg: PackageId }) {
  const [w, setW] = useState(0);
  const key = `mpasi_shop_${token.slice(0, 8)}_${plan.month}_${w}`;
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    try {
      setDone(JSON.parse(localStorage.getItem(key) || "[]"));
    } catch {
      setDone([]);
    }
  }, [key]);
  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    setDone(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  };
  const week = WEEKS[w];
  const list = shoppingList(plan, week.from, week.to);
  const groups: Record<string, string> = { protein: "Protein", karbo: "Karbohidrat", sayur: "Sayur", buah: "Buah", lemak: "Lemak & susu", bumbu: "Bumbu", lain: "Lainnya" };

  return (
    <>
      <header className="px-5 pt-6">
        <p className="text-2xl font-bold">Daftar belanja</p>
        <p className="text-xs text-muted">Bulan {plan.month} · jumlah total untuk satu minggu</p>
      </header>
      {locked ? (
        <Locked token={token} pkg={pkg} what="Daftar belanja mingguan" />
      ) : (
        <>
          <div className="mt-4 rounded-[24px] bg-orange-500 mx-5 p-5 text-white">
            <p className="text-xs opacity-80">{week.label} · hari {week.from}–{week.to}</p>
            <p className="mt-1 text-2xl font-bold">{list.length} bahan</p>
            <p className="text-xs opacity-90">{done.length} sudah dibeli</p>
          </div>
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5">
            {WEEKS.map((x, k) => (
              <button key={x.label} onClick={() => setW(k)} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${k === w ? "bg-teal-500 text-white" : "bg-teal-50 text-teal-700"}`}>
                {x.label}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-5 px-5">
            {Object.entries(groups).map(([g, label]) => {
              const items = list.filter((x) => x.group === g);
              if (!items.length) return null;
              return (
                <div key={g}>
                  <p className="mb-2 text-sm font-semibold">{label}</p>
                  <Card className="divide-y divide-line p-0">
                    {items.map((x) => {
                      const id = x.item + x.unit;
                      const on = done.includes(id);
                      return (
                        <button key={id} onClick={() => toggle(id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                          <span className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 ${on ? "border-teal-500 bg-teal-500 text-white" : "border-line"}`}>{on && <IconCheck className="h-3.5 w-3.5" />}</span>
                          <span className={`flex-1 text-sm ${on ? "text-muted line-through" : ""}`}>{x.item}</span>
                          <span className="text-sm font-semibold text-teal-600">
                            {x.qty} {x.unit}
                          </span>
                        </button>
                      );
                    })}
                  </Card>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

function FavTab({ token, favs, setFavs, locked, pkg }: { token: string; favs: string[]; setFavs: (f: string[]) => void; locked: boolean; pkg: PackageId }) {
  return (
    <>
      <header className="px-5 pt-6">
        <p className="text-2xl font-bold">Menu favorit</p>
        <p className="text-xs text-muted">Tandai menu yang disukai si kecil dengan ikon hati di halaman resep.</p>
      </header>
      {locked ? (
        <Locked token={token} pkg={pkg} what="Menu favorit" />
      ) : favs.length === 0 ? (
        <div className="mx-5 mt-8 rounded-[28px] bg-canvas p-8 text-center text-sm text-muted">Belum ada favorit. Buka resep lalu ketuk ♡.</div>
      ) : (
        <div className="mt-4 space-y-3 px-5">
          {favs.map((id) => {
            const r = RECIPE_MAP[id];
            if (!r) return null;
            return (
              <Card key={id} className="flex items-center gap-3">
                <FoodBubble emoji={r.emoji} size={52} />
                <Link href={`/m/${token}/resep/${id}`} className="flex-1 text-[15px] font-semibold">
                  {r.name}
                </Link>
                <button
                  aria-label="Hapus favorit"
                  className="text-orange-500"
                  onClick={async () => {
                    const res = await fetch("/api/favorite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, recipeId: id, on: false }) });
                    if (res.ok) setFavs((await res.json()).favorites);
                  }}
                >
                  <IconHeart filled className="h-6 w-6" />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function ProfileTab(p: { token: string; name: string; dob: string; pkg: PackageId; plans: Plan[]; swapsLeft: number; snackPlus: boolean; allergies: Allergen[]; month: number }) {
  const [copied, setCopied] = useState(false);
  const up = upsellFor(p.pkg);
  const link = typeof window !== "undefined" ? `${location.origin}/m/${p.token}` : "";
  const last = p.plans[p.plans.length - 1];
  const nextMonthStart = last.days[29].date;
  const admin = process.env.NEXT_PUBLIC_ADMIN_WA;
  return (
    <>
      <header className="flex flex-col items-center px-5 pt-8 text-center">
        <Avatar name={p.name} size={84} />
        <p className="mt-3 text-xl font-bold">{p.name}</p>
        <p className="text-xs text-muted">Lahir {new Date(p.dob + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
      </header>
      <div className="mt-6 space-y-3 px-5">
        <Card>
          <Row label="Paket" value={PACKAGES[p.pkg].name + (p.snackPlus ? " + Snack" : "")} />
          <Row label="Bulan tersedia" value={`${p.plans.length} bulan`} />
          <Row label="Sisa ganti menu" value={features(p.pkg).swaps ? `${p.swapsLeft}x` : "—"} />
          <Row label="Alergi dihindari" value={p.allergies.length ? p.allergies.join(", ") : "Tidak ada"} />
        </Card>

        <Card className="space-y-2">
          <p className="text-sm font-semibold">Simpan akses</p>
          <p className="text-xs text-muted">Link ini kunci menu Bunda. Simpan di WhatsApp sendiri atau bookmark.</p>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(link);
              setCopied(true);
            }}
            className="w-full rounded-full border-2 border-teal-500 py-2.5 text-sm font-semibold text-teal-600"
          >
            {copied ? "Link tersalin ✓" : "Salin link akses"}
          </button>
          <a href={`/m/${p.token}/cetak?b=${p.month + 1}`} target="_blank" className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-500 py-2.5 text-sm font-semibold text-white">
            <IconPrint /> Unduh / cetak PDF bulan {p.month + 1}
          </a>
        </Card>

        {up && (
          <Card className="border-2 border-dashed border-orange-400 bg-orange-50">
            <p className="text-sm font-semibold">{up.title}</p>
            <p className="mt-1 text-xs text-muted">{up.desc}</p>
            <UpsellButton token={p.token} label={`Tambah ${rupiah(up.price)}`} />
          </Card>
        )}

        <Card>
          <p className="text-sm font-semibold">Menu bulan berikutnya</p>
          <p className="mt-1 text-xs text-muted">
            Menu bulan ke-{p.plans.length + 1} disusun ulang sesuai usia dan tekstur baru {p.name}, mulai {new Date(nextMonthStart + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long" })}.
          </p>
          <UpsellButton token={p.token} type="renewal" variant="primary" label={`Buat menu bulan ${p.plans.length + 1} · ${rupiah(RENEWAL_PRICE)}`} />
        </Card>

        {admin && (
          <a href={`https://wa.me/${admin}`} className="block rounded-[var(--radius-card)] bg-canvas p-4 text-center text-sm font-medium text-teal-700">
            Butuh bantuan? Chat admin
          </a>
        )}
        <p className="pb-4 text-center text-[11px] text-muted">
          Ingin data dihapus? <Link href="/privasi" className="underline">Lihat kebijakan privasi</Link>
        </p>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-line py-2.5 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
