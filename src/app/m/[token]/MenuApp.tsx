"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, Button, SectionHead } from "@/components/ui";
import { Photo, Plate, RecipePlate } from "@/components/Img";
import { FoodCard, FoodRow, MEAL_LABEL } from "@/components/food";
import { Item, Sheet, Stagger, IOS_EASE } from "@/components/motion";
import UpsellButton from "@/components/UpsellButton";
import { IconCart, IconChat, IconCheck, IconChevron, IconEdit, IconHeart, IconHome, IconLink, IconLock, IconPrint, IconSearch, IconSwap, IconUser, IconCalendar, IconBell } from "@/components/icons";
import { ageLabel, shoppingList, todayJakarta, WEEKS } from "@/lib/generator";
import { features, PACKAGES, RENEWAL_PRICE, rupiah, upsellFor } from "@/lib/pricing";
import { ING, RECIPE_MAP } from "@/lib/recipes";
import { store } from "@/lib/client";
import type { Allergen, PackageId, Plan } from "@/lib/types";

type Tab = "menu" | "cari" | "belanja" | "favorit" | "profil";
const TABS: { id: Tab; label: string; Icon: (p: { className?: string }) => React.ReactElement }[] = [
  { id: "menu", label: "Beranda", Icon: IconHome },
  { id: "cari", label: "Resep", Icon: IconSearch },
  { id: "belanja", label: "Belanja", Icon: IconCart },
  { id: "favorit", label: "Favorit", Icon: (p) => <IconHeart {...p} /> },
  { id: "profil", label: "Profil", Icon: IconUser },
];

type Props = { token: string; name: string; dob: string; pkg: PackageId; plans: Plan[]; favorites: string[]; swapsLeft: number; snackPlus: boolean; allergies: Allergen[] };

export default function MenuApp(props: Props) {
  const { token, pkg } = props;
  const [plans, setPlans] = useState(props.plans);
  const [favs, setFavs] = useState(props.favorites);
  const [swapsLeft, setSwapsLeft] = useState(props.swapsLeft);
  const [tab, setTab] = useState<Tab>("menu");
  const [dir, setDir] = useState(1);
  const f = features(pkg, plans.length);
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
    if (t && TABS.some((x) => x.id === t)) setTab(t);
  }, [token]);

  function go(t: Tab) {
    setDir(TABS.findIndex((x) => x.id === t) > TABS.findIndex((x) => x.id === tab) ? 1 : -1);
    setTab(t);
    window.scrollTo({ top: 0 });
  }

  async function swap(mealIndex: number) {
    const day = plans[month].days[dayIdx];
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
  }
  async function toggleFav(id: string, on: boolean) {
    const r = await fetch("/api/favorite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, recipeId: id, on }) });
    if (r.ok) setFavs((await r.json()).favorites);
  }

  return (
    <main className="min-h-dvh pb-28">
      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={tab}
          custom={dir}
          variants={{ enter: (d: number) => ({ x: d * 40, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d: number) => ({ x: d * -40, opacity: 0 }) }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: IOS_EASE }}
        >
          {tab === "menu" && <HomeTab {...props} plans={plans} month={month} setMonth={setMonth} dayIdx={dayIdx} setDayIdx={setDayIdx} swapsLeft={swapsLeft} f={f} onSwap={swap} go={go} />}
          {tab === "cari" && <SearchTab token={token} name={props.name} plans={plans} favs={favs} toggleFav={toggleFav} canFav={f.favorites} />}
          {tab === "belanja" && <ShopTab token={token} plan={plans[month]} locked={!f.shopping} pkg={pkg} />}
          {tab === "favorit" && <FavTab token={token} favs={favs} toggleFav={toggleFav} locked={!f.favorites} pkg={pkg} />}
          {tab === "profil" && <ProfileTab {...props} plans={plans} swapsLeft={swapsLeft} month={month} />}
        </motion.div>
      </AnimatePresence>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[440px] justify-around rounded-t-[28px] bg-white px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2.5 shadow-[0_-8px_30px_rgba(29,36,51,0.08)]">
        {TABS.map(({ id, label, Icon }) => {
          const on = tab === id;
          return (
            <motion.button key={id} whileTap={{ scale: 0.9 }} onClick={() => go(id)} className={`relative flex w-16 flex-col items-center gap-1 py-1 text-[10.5px] ${on ? "font-semibold text-teal-600" : "text-muted"}`}>
              {on && <motion.span layoutId="navdot" className="absolute -top-2.5 h-1 w-8 rounded-full bg-teal-500" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
              <Icon className="h-[22px] w-[22px]" />
              {label}
            </motion.button>
          );
        })}
      </nav>
    </main>
  );
}

// ───────────── Beranda ─────────────
function HomeTab(p: Props & { plans: Plan[]; month: number; setMonth: (m: number) => void; dayIdx: number; setDayIdx: (d: number) => void; swapsLeft: number; f: ReturnType<typeof features>; onSwap: (i: number) => Promise<void>; go: (t: Tab) => void }) {
  const { token, name, dob, plans, month, setMonth, dayIdx, setDayIdx, swapsLeft, f } = p;
  const plan = plans[month];
  const day = plan.days[dayIdx];
  const strip = useRef<HTMLDivElement>(null);
  const [monthSheet, setMonthSheet] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const tomorrow = plan.days[dayIdx + 1];

  useEffect(() => {
    strip.current?.querySelector<HTMLElement>(`[data-d="${dayIdx}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [dayIdx, month]);

  return (
    <>
      <header className="px-5 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] text-muted">Halo, Bunda 👋 Menu hari ini untuk</p>
            <h1 className="text-[30px] font-bold leading-tight">{name}</h1>
          </div>
          <Avatar name={name} size={48} />
        </div>
        <div className="mt-3 flex items-end justify-between">
          <span className="text-xs text-muted">{new Date(day.date + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</span>
          <span className="text-sm font-semibold text-teal-500">Hari</span>
        </div>
        <div ref={strip} className="no-scrollbar -mx-5 mt-1 flex h-[64px] items-end gap-5 overflow-x-auto px-[42%] pb-1">
          {plan.days.map((x, k) => {
            const dist = Math.abs(k - dayIdx);
            return (
              <motion.button
                key={x.day}
                data-d={k}
                onClick={() => setDayIdx(k)}
                animate={{ fontSize: dist === 0 ? 52 : dist === 1 ? 30 : 24, opacity: dist === 0 ? 1 : dist === 1 ? 0.55 : 0.25 }}
                transition={{ duration: 0.35, ease: IOS_EASE }}
                className="shrink-0 font-semibold leading-none text-teal-500"
              >
                {x.day}
              </motion.button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-[18px] bg-[#f7f8fa] py-2 pl-4 pr-2">
          <IconCalendar className="h-4 w-4 text-muted" />
          <p className="flex-1 truncate text-[13px] text-muted">
            Bulan {month + 1} · {ageLabel(dob, day.date)}
          </p>
          <button onClick={() => setMonthSheet(true)} className="rounded-[14px] bg-teal-500 px-4 py-2 text-xs font-semibold text-white">
            Ganti
          </button>
        </div>
      </header>

      {(day.textureUp || (day.prepDay && f.mealprep) || day.meals.some((m) => m.newAllergen)) && (
        <section className="mt-4 space-y-2 px-5">
          {day.textureUp && <Banner tone="teal" photo="x_steamedrice" title="Tekstur naik tahap" text="Mulai hari ini tekstur lebih kasar. Lihat catatan tekstur di resep." />}
          {day.prepDay && f.mealprep && <Banner tone="orange" photo="x_riceporridge" title="Hari masak" text="Siapkan menu 3 hari sekaligus. Kulkas maks. 2 hari, sisanya freezer." />}
          {day.meals
            .filter((m) => m.newAllergen)
            .map((m) => (
              <Banner key={m.recipeId} tone="rose" photo={m.newAllergen === "telur" ? "egg" : m.newAllergen === "ikan" ? "mackerel" : m.newAllergen === "susu" ? "cheese" : m.newAllergen === "seafood" ? "shrimp" : m.newAllergen === "kedelai" ? "tofu" : "bread"} title={`Pengenalan ${m.newAllergen}`} text="Berikan saat sarapan, amati reaksi selama 3 hari." />
            ))}
        </section>
      )}

      <section className="mt-6">
        <div className="px-5">
          <SectionHead title={`Menu hari ${day.day}`} action={f.swaps ? `${swapsLeft}x ganti tersisa` : undefined} />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`${month}-${dayIdx}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3, ease: IOS_EASE }} className="no-scrollbar flex snap-x gap-4 overflow-x-auto px-5 pb-6 pt-1">
            {day.meals.map((m, k) => (
              <div key={k + m.recipeId} className="flex shrink-0 flex-col items-center gap-2">
                <FoodCard meal={m} href={`/m/${token}/resep/${m.recipeId}?b=${month + 1}&d=${day.day}&s=${k}`} />
                {f.swaps > 0 && !m.newAllergen && (
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    disabled={busy !== null || swapsLeft <= 0}
                    onClick={async () => {
                      setBusy(k);
                      await p.onSwap(k);
                      setBusy(null);
                    }}
                    className="flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1.5 text-[11px] font-medium text-teal-700 disabled:opacity-40"
                  >
                    <IconSwap className="h-3.5 w-3.5" /> {busy === k ? "Mengganti…" : "Ganti"}
                  </motion.button>
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {tomorrow && (
        <section className="px-5">
          <SectionHead title="Persiapan besok" action="Lihat" onAction={() => setDayIdx(dayIdx + 1)} />
          <Stagger className="space-y-3">
            {tomorrow.meals
              .filter((m) => m.slot === "utama")
              .map((m) => (
                <Item key={m.recipeId + m.label}>
                  <FoodRow recipeId={m.recipeId} label={MEAL_LABEL[m.label]} href={`/m/${token}/resep/${m.recipeId}?b=${month + 1}&d=${tomorrow.day}`} />
                </Item>
              ))}
          </Stagger>
        </section>
      )}

      <section className="mt-6 px-5">
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => p.go("belanja")} className="relative w-full overflow-hidden rounded-[28px] bg-orange-500 p-5 text-left text-white shadow-[0_16px_34px_rgba(251,154,27,0.3)]">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <Plate k="d_vegsteam" size={92} className="absolute right-3 top-1/2 -translate-y-1/2" />
          <p className="text-xs opacity-90">Daftar belanja</p>
          <p className="mt-1 max-w-[65%] text-[17px] font-bold leading-snug">Belanja sekali untuk seminggu</p>
          <span className="mt-3 inline-flex items-center gap-1 rounded-[12px] bg-white px-4 py-2 text-xs font-semibold text-orange-600">
            Buka daftar <IconChevron className="h-3.5 w-3.5" />
          </span>
        </motion.button>
      </section>

      <p className="mt-6 px-8 text-center text-[11px] leading-relaxed text-muted">Tetap lanjutkan ASI. Ikuti tanda lapar dan kenyang. Panduan edukasi, bukan pengganti dokter.</p>

      <Sheet open={monthSheet} onClose={() => setMonthSheet(false)} title="Pilih bulan">
        <div className="space-y-3 px-5 pb-4">
          {plans.map((pl, m) => (
            <motion.button
              key={m}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setMonth(m);
                setDayIdx(0);
                setMonthSheet(false);
              }}
              className={`flex w-full items-center gap-3 rounded-[20px] p-3 text-left ${m === month ? "bg-teal-50 ring-2 ring-teal-500" : "bg-[#f7f8fa]"}`}
            >
              <RecipePlate recipeId={pl.days[0].meals[0].recipeId} size={52} />
              <span className="flex-1">
                <span className="block font-semibold">Bulan {m + 1}</span>
                <span className="text-xs text-muted">Mulai {new Date(pl.startDate + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long" })}</span>
              </span>
            </motion.button>
          ))}
          <p className="pt-1 text-center text-xs text-muted">Menu bulan berikutnya tersedia di Profil.</p>
        </div>
      </Sheet>
    </>
  );
}

function Banner({ tone, photo, title, text }: { tone: "teal" | "orange" | "rose"; photo: string; title: string; text: string }) {
  const c = { teal: "bg-teal-50 text-teal-700", orange: "bg-orange-50 text-orange-700", rose: "bg-[#fdeef0] text-[#b4234a]" }[tone];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-3 rounded-[20px] p-2.5 pr-4 ${c}`}>
      <Photo k={photo} w={44} round className="h-11 w-11 shrink-0" />
      <div>
        <p className="text-[13px] font-semibold">{title}</p>
        <p className="text-[11.5px] leading-snug opacity-80">{text}</p>
      </div>
    </motion.div>
  );
}

// ───────────── Cari resep ─────────────
function SearchTab({ token, name, plans, favs, toggleFav, canFav }: { token: string; name: string; plans: Plan[]; favs: string[]; toggleFav: (id: string, on: boolean) => void; canFav: boolean }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | "utama" | "snack" | "protein">("all");
  const all = useMemo(() => {
    const ids = new Set<string>();
    const out: { id: string; day: number; month: number }[] = [];
    plans.forEach((pl, m) =>
      pl.days.forEach((d) =>
        d.meals.forEach((x) => {
          if (!ids.has(x.recipeId)) {
            ids.add(x.recipeId);
            out.push({ id: x.recipeId, day: d.day, month: m + 1 });
          }
        }),
      ),
    );
    return out;
  }, [plans]);
  const list = all.filter(({ id }) => {
    const r = RECIPE_MAP[id];
    if (!r) return false;
    if (cat === "utama" && r.slot !== "utama") return false;
    if (cat === "snack" && r.slot !== "snack") return false;
    if (cat === "protein" && !r.tags.includes("zat-besi")) return false;
    const text = (r.name + " " + r.ingredients.map((i) => i.item).join(" ")).toLowerCase();
    return !q || text.includes(q.toLowerCase());
  });
  const cats = [
    { id: "all", label: "Semua", k: "d_babyfood" },
    { id: "utama", label: "Makan utama", k: "x_chickenrice" },
    { id: "snack", label: "Snack", k: "d_fruitbowl" },
    { id: "protein", label: "Zat besi", k: "liver" },
  ] as const;
  return (
    <>
      <header className="px-5 pt-6">
        <p className="text-[24px] font-bold leading-tight">Resep untuk {name}</p>
        <p className="text-xs text-muted">{all.length} resep di menu Bunda</p>
        <div className="mt-4 flex gap-3">
          <label className="flex flex-1 items-center gap-2 rounded-[16px] bg-[#f7f8fa] px-4">
            <IconSearch className="h-4 w-4 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari resep atau bahan…" className="w-full bg-transparent py-3.5 text-[14px] outline-none" />
          </label>
          <span className="flex w-12 items-center justify-center rounded-[16px] bg-teal-500 text-white">
            <IconSearch className="h-5 w-5" />
          </span>
        </div>
      </header>
      <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto px-5">
        {cats.map((c) => (
          <motion.button key={c.id} whileTap={{ scale: 0.93 }} onClick={() => setCat(c.id)} className="flex shrink-0 flex-col items-center gap-1.5">
            <Photo k={c.k} w={60} round className={`h-[60px] w-[60px] ring-[3px] ${cat === c.id ? "ring-teal-500" : "ring-transparent"}`} />
            <span className={`text-[11.5px] ${cat === c.id ? "font-semibold text-teal-600" : "text-muted"}`}>{c.label}</span>
          </motion.button>
        ))}
      </div>
      <Stagger className="mt-5 space-y-3 px-5" key={cat + q}>
        {list.slice(0, 60).map(({ id, day, month }) => (
          <Item key={id}>
            <FoodRow
              recipeId={id}
              label={`Bulan ${month} · hari ${day}`}
              href={`/m/${token}/resep/${id}?b=${month}&d=${day}`}
              right={
                canFav ? (
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFav(id, !favs.includes(id));
                    }}
                    className="mr-1 flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-500"
                    aria-label="Favorit"
                  >
                    <IconHeart filled={favs.includes(id)} className="h-5 w-5" />
                  </motion.button>
                ) : undefined
              }
            />
          </Item>
        ))}
        {list.length === 0 && <p className="py-10 text-center text-sm text-muted">Tidak ada resep yang cocok.</p>}
      </Stagger>
    </>
  );
}

// ───────────── Paket terkunci ─────────────
function Locked({ token, pkg, what, photo }: { token: string; pkg: PackageId; what: string; photo: string }) {
  const up = upsellFor(pkg);
  return (
    <div className="mx-5 mt-6 flex flex-col items-center rounded-[28px] bg-teal-50 p-6 text-center">
      <div className="relative">
        <Plate k={photo} size={120} />
        <span className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white ring-4 ring-teal-50">
          <IconLock className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 font-semibold">{what} ada di paket Lengkap</p>
      {up && <p className="mt-1 text-sm text-muted">{up.desc}</p>}
      {up && <UpsellButton token={token} label={`Buka sekarang · ${rupiah(up.price)}`} variant="primary" />}
    </div>
  );
}

// ───────────── Belanja ─────────────
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
  const list = useMemo(() => shoppingList(plan, week.from, week.to), [plan, week]);
  const photoOf = (item: string) => Object.values(ING).find((g) => g.name === item)?.photo ?? "d_babyfood";
  const pct = list.length ? Math.round((done.length / list.length) * 100) : 0;

  return (
    <>
      <header className="px-5 pt-6">
        <p className="text-[24px] font-bold">Daftar belanja</p>
        <p className="text-xs text-muted">Bulan {plan.month} · total untuk satu minggu</p>
      </header>
      {locked ? (
        <Locked token={token} pkg={pkg} what="Daftar belanja mingguan" photo="d_vegsteam" />
      ) : (
        <>
          <div className="relative mx-5 mt-4 overflow-hidden rounded-[28px] bg-orange-500 p-5 text-white shadow-[0_16px_34px_rgba(251,154,27,0.3)]">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <Plate k="d_fruitbowl" size={96} className="absolute right-4 top-1/2 -translate-y-1/2" />
            <p className="text-xs opacity-90">
              {week.label} · hari {week.from}–{week.to}
            </p>
            <p className="mt-1 text-[26px] font-bold">{list.length} bahan</p>
            <div className="mt-2 h-2 w-[55%] overflow-hidden rounded-full bg-white/30">
              <motion.div className="h-full rounded-full bg-white" animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: IOS_EASE }} />
            </div>
            <p className="mt-1.5 text-xs opacity-90">{done.length} sudah dibeli</p>
          </div>
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5">
            {WEEKS.map((x, k) => (
              <motion.button whileTap={{ scale: 0.94 }} key={x.label} onClick={() => setW(k)} className={`relative shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${k === w ? "text-white" : "bg-[#f7f8fa] text-muted"}`}>
                {k === w && <motion.span layoutId="weekpill" className="absolute inset-0 rounded-full bg-teal-500" />}
                <span className="relative">{x.label}</span>
              </motion.button>
            ))}
          </div>
          <Stagger className="mt-4 space-y-2.5 px-5" key={w}>
            {list.map((x) => {
              const id = x.item + x.unit;
              const on = done.includes(id);
              return (
                <Item key={id}>
                  <motion.button whileTap={{ scale: 0.98 }} onClick={() => toggle(id)} className="flex w-full items-center gap-3 rounded-[20px] bg-white p-2.5 pr-3 text-left shadow-[0_6px_20px_rgba(29,36,51,0.06)]">
                    <Photo k={photoOf(x.item)} w={56} className="h-14 w-14 shrink-0 rounded-[16px]" />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[14px] font-medium ${on ? "text-muted line-through" : ""}`}>{x.item}</span>
                      <span className="text-[12px] font-semibold text-teal-600">
                        {x.qty} {x.unit}
                      </span>
                    </span>
                    <motion.span animate={{ scale: on ? [1, 1.25, 1] : 1 }} className={`flex h-8 w-8 items-center justify-center rounded-full ${on ? "bg-orange-500 text-white" : "border-2 border-orange-400 text-transparent"}`}>
                      <IconCheck className="h-4 w-4" />
                    </motion.span>
                  </motion.button>
                </Item>
              );
            })}
          </Stagger>
        </>
      )}
    </>
  );
}

// ───────────── Favorit ─────────────
function FavTab({ token, favs, toggleFav, locked, pkg }: { token: string; favs: string[]; toggleFav: (id: string, on: boolean) => void; locked: boolean; pkg: PackageId }) {
  const [kind, setKind] = useState<"utama" | "snack">("utama");
  const list = favs.filter((id) => RECIPE_MAP[id]?.slot === kind);
  return (
    <>
      <header className="px-5 pt-6">
        <p className="text-[24px] font-bold">Favorit</p>
        <p className="text-xs text-muted">Menu yang disukai si kecil</p>
      </header>
      {locked ? (
        <Locked token={token} pkg={pkg} what="Menu favorit" photo="d_pancake" />
      ) : (
        <>
          <div className="mt-4 flex gap-2 px-5">
            {(
              [
                ["utama", "Makan utama"],
                ["snack", "Snack"],
              ] as const
            ).map(([k, l]) => (
              <motion.button whileTap={{ scale: 0.94 }} key={k} onClick={() => setKind(k)} className={`relative rounded-full px-5 py-2 text-xs font-semibold ${kind === k ? "text-white" : "bg-[#f7f8fa] text-muted"}`}>
                {kind === k && <motion.span layoutId="favpill" className="absolute inset-0 rounded-full bg-teal-500" />}
                <span className="relative">{l}</span>
              </motion.button>
            ))}
          </div>
          {list.length === 0 ? (
            <div className="mx-5 mt-6 flex flex-col items-center rounded-[28px] bg-[#f7f8fa] p-8 text-center text-sm text-muted">
              <Plate k="d_babyfood" size={110} />
              <p className="mt-4">Belum ada favorit. Buka resep lalu ketuk ♡.</p>
            </div>
          ) : (
            <Stagger className="mt-4 space-y-3 px-5" key={kind}>
              {list.map((id) => (
                <Item key={id}>
                  <FoodRow
                    recipeId={id}
                    href={`/m/${token}/resep/${id}`}
                    right={
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFav(id, false);
                        }}
                        className="mr-1 flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-500"
                        aria-label="Hapus favorit"
                      >
                        <IconHeart filled className="h-5 w-5" />
                      </motion.button>
                    }
                  />
                </Item>
              ))}
            </Stagger>
          )}
        </>
      )}
    </>
  );
}

// ───────────── Profil ─────────────
function ProfileTab(p: Props & { plans: Plan[]; swapsLeft: number; month: number }) {
  const [copied, setCopied] = useState(false);
  const [notif, setNotif] = useState(true);
  const up = upsellFor(p.pkg);
  const link = typeof window !== "undefined" ? `${location.origin}/m/${p.token}` : "";
  const last = p.plans[p.plans.length - 1];
  const admin = process.env.NEXT_PUBLIC_ADMIN_WA;
  const rows: { icon: React.ReactNode; label: string; value?: string; onClick?: () => void; href?: string }[] = [
    { icon: <IconUser className="h-5 w-5" />, label: "Paket", value: PACKAGES[p.pkg].name + (p.snackPlus ? " + Snack" : "") },
    { icon: <IconCalendar className="h-5 w-5" />, label: "Bulan tersedia", value: `${p.plans.length} bulan` },
    { icon: <IconSwap className="h-5 w-5" />, label: "Sisa ganti menu", value: features(p.pkg).swaps ? `${p.swapsLeft}x` : "—" },
    { icon: <IconPrint className="h-5 w-5" />, label: `Unduh / cetak PDF bulan ${p.month + 1}`, href: `/m/${p.token}/cetak?b=${p.month + 1}` },
    ...(admin ? [{ icon: <IconChat className="h-5 w-5" />, label: "Chat admin", href: `https://wa.me/${admin}` }] : []),
  ];
  return (
    <>
      <header className="flex flex-col items-center px-5 pt-8 text-center">
        <div className="relative">
          <Avatar name={p.name} size={92} />
          <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-white ring-4 ring-white">
            <IconEdit />
          </span>
        </div>
        <p className="mt-3 text-xl font-bold">{p.name}</p>
        <p className="text-xs text-muted">Lahir {new Date(p.dob + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · {p.allergies.length ? `tanpa ${p.allergies.join(", ")}` : "tanpa alergi"}</p>
      </header>

      <div className="mt-6 px-5">
        <p className="mb-2 text-[13px] font-semibold text-muted">Notifikasi</p>
        <div className="flex items-center gap-3 rounded-[20px] bg-[#f7f8fa] p-4">
          <IconBell className="h-5 w-5 text-teal-600" />
          <span className="flex-1 text-sm">Pengingat menu harian</span>
          <button onClick={() => setNotif(!notif)} className={`relative h-7 w-12 rounded-full transition ${notif ? "bg-teal-500" : "bg-line"}`} aria-label="Pengingat">
            <motion.span layout className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${notif ? "right-1" : "left-1"}`} />
          </button>
        </div>
        <p className="mb-2 mt-5 text-[13px] font-semibold text-muted">Menu</p>
        <div className="divide-y divide-line rounded-[20px] bg-[#f7f8fa]">
          {rows.map((r) => {
            const inner = (
              <>
                <span className="text-teal-600">{r.icon}</span>
                <span className="flex-1 text-sm">{r.label}</span>
                {r.value ? <span className="text-sm font-medium">{r.value}</span> : <IconChevron className="h-4 w-4 text-muted" />}
              </>
            );
            return r.href ? (
              <Link key={r.label} href={r.href} target={r.href.startsWith("http") || r.href.includes("cetak") ? "_blank" : undefined} className="flex items-center gap-3 p-4">
                {inner}
              </Link>
            ) : (
              <div key={r.label} className="flex items-center gap-3 p-4">
                {inner}
              </div>
            );
          })}
        </div>

        {up && (
          <div className="relative mt-5 overflow-hidden rounded-[24px] border-2 border-dashed border-orange-400 bg-orange-50 p-4">
            <p className="text-sm font-semibold">{up.title}</p>
            <p className="mt-1 text-xs text-muted">{up.desc}</p>
            <UpsellButton token={p.token} label={`Tambah ${rupiah(up.price)}`} />
          </div>
        )}

        <div className="mt-5 rounded-[24px] bg-teal-50 p-4">
          <p className="text-sm font-semibold">Menu bulan ke-{p.plans.length + 1}</p>
          <p className="mt-1 text-xs text-muted">
            Disusun ulang sesuai usia dan tekstur baru {p.name}, mulai {new Date(last.days[29].date + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long" })}.
          </p>
          <UpsellButton token={p.token} type="renewal" variant="primary" label={`Buat menu bulan ${p.plans.length + 1} · ${rupiah(RENEWAL_PRICE)}`} />
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(link);
              setCopied(true);
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <IconLink /> {copied ? "Link tersalin ✓" : "Salin link akses"}
            </span>
          </Button>
          <p className="mt-3 pb-4 text-center text-[11px] text-muted">
            Link ini kunci menu Bunda — simpan di WhatsApp. <Link href="/privasi" className="underline">Privasi & hapus data</Link> · <Link href="/kredit-foto" className="underline">Kredit foto</Link>
          </p>
        </div>
      </div>
    </>
  );
}

