"use client";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, LinkButton, SectionHead } from "@/components/ui";
import { Photo, Plate, RecipePlate } from "@/components/Img";
import { CategoryTile, FoodCard, FoodRow, MEAL_LABEL } from "@/components/food";
import { Item, Sheet, Stagger, IOS_EASE } from "@/components/motion";
import { RecipeBody } from "@/components/RecipeView";
import { IconCheck, IconLock } from "@/components/icons";
import { store, track } from "@/lib/client";
import { ageLabel, dailyNeeds, generatePlan, seedFor, todayJakarta } from "@/lib/generator";
import { PACKAGES, rupiah } from "@/lib/pricing";
import { RECIPE_MAP } from "@/lib/recipes";
import { parseAnswers } from "@/lib/validate";
import type { Meal, QuizAnswers, Stage } from "@/lib/types";

const ALLERGY_LABEL: Record<string, string> = { telur: "telur", susu: "susu sapi", ikan: "ikan", seafood: "udang/seafood", kacang: "kacang", kedelai: "kedelai", gandum: "gandum" };
const STAGE_LABEL = { 1: "Pure & lumat", 2: "Cincang & finger food", 3: "Makanan keluarga" } as const;
const STAGE_PHOTO = { 1: "x_carrotsoup", 2: "x_steamedrice", 3: "d_ricebowl" } as const;

export default function Page() {
  return (
    <Suspense>
      <Hasil />
    </Suspense>
  );
}

function Hasil() {
  const router = useRouter();
  const sp = useSearchParams();
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [building, setBuilding] = useState(sp.get("baru") === "1");
  const [day, setDay] = useState(0);
  const [sheet, setSheet] = useState<null | "needs" | "texture" | "allergy" | { meal: Meal; stage: Stage }>(null);
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const a = parseAnswers(store.getAnswers());
    if (!a) {
      router.replace("/kuis");
      return;
    }
    setAnswers(a);
  }, [router]);

  const plan = useMemo(() => (answers ? generatePlan(answers, { seed: seedFor(answers), today: todayJakarta() }) : null), [answers]);
  useEffect(() => {
    if (plan && !building) track("ViewResult");
  }, [plan, building]);
  useEffect(() => {
    strip.current?.querySelector<HTMLElement>(`[data-d="${day}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [day, building]);
  const finish = useCallback(() => {
    setBuilding(false);
    router.replace("/hasil");
  }, [router]);

  if (!answers || !plan) return <main className="min-h-dvh" />;
  if (building) return <Building a={answers} stage={plan.days[0].stage} date={plan.days[0].date} onDone={finish} />;

  const name = answers.name;
  const d = plan.days[day];
  const locked = day >= 3;
  const needs = dailyNeeds(plan.days[0].ageMonths);
  const sheetTitle = sheet === "needs" ? `Kebutuhan harian ${name}` : sheet === "texture" ? "Tahap tekstur" : sheet === "allergy" ? "Alergi & pengenalan alergen" : undefined;

  return (
    <main className="pb-32">
      <header className="px-5 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] text-muted">Menu personal untuk</p>
            <h1 className="text-[30px] font-bold leading-tight">{name}</h1>
          </div>
          <Avatar name={name} size={48} />
        </div>

        <div className="mt-3 flex items-end justify-between">
          <span className="text-xs text-muted">{new Date(d.date + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</span>
          <span className="text-sm font-semibold text-teal-500">Hari</span>
        </div>
        <div ref={strip} className="no-scrollbar -mx-5 mt-1 flex h-[64px] items-end gap-5 overflow-x-auto px-[42%] pb-1">
          {plan.days.map((x, k) => {
            const dist = Math.abs(k - day);
            return (
              <motion.button
                key={x.day}
                data-d={k}
                onClick={() => setDay(k)}
                animate={{ fontSize: dist === 0 ? 52 : dist === 1 ? 30 : 24, opacity: dist === 0 ? 1 : dist === 1 ? 0.55 : 0.25 }}
                transition={{ duration: 0.35, ease: IOS_EASE }}
                className="relative shrink-0 font-semibold leading-none text-teal-500"
              >
                {x.day}
                {k >= 3 && <IconLock className="absolute -right-3 top-0 h-3 w-3 text-muted" />}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-[18px] bg-[#f7f8fa] py-2 pl-4 pr-2">
          <p className="flex-1 truncate text-[13px] text-muted">
            {ageLabel(answers.dob, plan.days[0].date)} · {answers.allergies.length ? `tanpa ${answers.allergies.map((x) => ALLERGY_LABEL[x]).join(", ")}` : "tanpa alergi"}
          </p>
          <Link href="/kuis" className="rounded-[14px] bg-teal-500 px-4 py-2 text-xs font-semibold text-white">
            Ubah
          </Link>
        </div>
      </header>

      <section className="mt-5 grid grid-cols-3 gap-3 px-5">
        <CategoryTile k="d_babyfood" label="Kebutuhan" onClick={() => setSheet("needs")} />
        <CategoryTile k={STAGE_PHOTO[d.stage]} label="Tekstur" tint="orange" onClick={() => setSheet("texture")} />
        <CategoryTile k="egg" label="Alergen" tint="rose" onClick={() => setSheet("allergy")} />
      </section>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section key={day} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease: IOS_EASE }} className="mt-7">
          <div className="px-5">
            <SectionHead title={`Menu hari ${d.day}`} action={locked ? "Terkunci" : "Gratis"} />
          </div>
          {d.prepDay && !locked && <p className="mx-5 mb-3 rounded-[18px] bg-orange-50 px-4 py-3 text-[13px] text-orange-700">Hari masak: siapkan menu untuk 3 hari ke depan sekaligus.</p>}
          <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto px-5 pb-6 pt-1">
            {d.meals.map((m, k) => (
              <FoodCard key={k} meal={m} locked={locked} onClick={() => (locked ? router.push("/checkout") : setSheet({ meal: m, stage: d.stage }))} />
            ))}
          </div>
        </motion.section>
      </AnimatePresence>

      <section className="px-5">
        <div className="relative overflow-hidden rounded-[28px] bg-orange-500 p-5 text-white shadow-[0_16px_34px_rgba(251,154,27,0.35)]">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <RecipePlate recipeId={plan.days[4].meals[0].recipeId} size={108} className="absolute -right-3 bottom-4" />
          <p className="text-xs font-medium opacity-90">27 hari lagi sudah tersusun</p>
          <p className="mt-1 max-w-[62%] text-[19px] font-bold leading-snug">Buka 30 hari menu {name}</p>
          <p className="mt-1 text-xs opacity-90">Mulai {rupiah(PACKAGES.dasar.price)} · sekali bayar QRIS</p>
          <motion.div whileTap={{ scale: 0.95 }} className="inline-block">
            <Link href="/checkout" className="mt-4 inline-block rounded-[14px] bg-white px-5 py-2.5 text-sm font-semibold text-orange-600">
              Lihat paket
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="mt-7 px-5">
        <SectionHead title={`Minggu ini untuk ${name}`} />
        <Stagger className="space-y-3">
          {plan.days.slice(1, 7).map((x) => (
            <Item key={x.day}>
              <FoodRow
                recipeId={x.meals.find((m) => m.slot === "utama")!.recipeId}
                label={`Hari ${x.day} · ${MEAL_LABEL[x.meals[0].label]}`}
                locked={x.day > 3}
                onClick={() => (x.day > 3 ? router.push("/checkout") : setDay(x.day - 1))}
              />
            </Item>
          ))}
        </Stagger>
      </section>

      <p className="mt-8 px-8 text-center text-[11px] leading-relaxed text-muted">Panduan edukasi, bukan pengganti konsultasi dokter. Bila BB tidak naik atau ada reaksi alergi berat, periksakan ke dokter anak atau posyandu.</p>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[440px] bg-gradient-to-t from-white via-white to-white/0 px-5 pb-5 pt-8">
        <LinkButton href="/checkout">Buka 30 hari · mulai {rupiah(PACKAGES.dasar.price)}</LinkButton>
      </div>

      <Sheet open={sheet !== null} onClose={() => setSheet(null)} title={sheetTitle}>
        {sheet === "needs" && (
          <div className="grid grid-cols-2 gap-3 px-5 pb-4 text-[13px]">
            {[
              ["Makan utama", needs.meals],
              ["Selingan", needs.snack],
              ["Porsi", needs.portion],
              ["Protein hewani", "Setiap hari"],
            ].map(([l, v]) => (
              <div key={l} className="rounded-[18px] bg-[#f7f8fa] p-3">
                <p className="text-[11px] text-muted">{l}</p>
                <p className="mt-0.5 font-medium leading-snug">{v}</p>
              </div>
            ))}
            <p className="col-span-2 text-[11px] text-muted">Patokan umum WHO & IDAI. Tetap lanjutkan ASI dan ikuti tanda lapar–kenyang si kecil.</p>
          </div>
        )}
        {sheet === "texture" && (
          <div className="space-y-3 px-5 pb-4">
            {([1, 2, 3] as const).map((s) => (
              <div key={s} className={`flex items-center gap-3 rounded-[20px] p-3 ${s === d.stage ? "bg-teal-50 ring-2 ring-teal-500" : "bg-[#f7f8fa]"}`}>
                <Photo k={STAGE_PHOTO[s]} w={56} className="h-14 w-14 rounded-2xl" />
                <div>
                  <p className="font-semibold">{STAGE_LABEL[s]}</p>
                  <p className="text-xs text-muted">{["6–8 bulan", "9–11 bulan", "12–23 bulan"][s - 1]}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {sheet === "allergy" && (
          <div className="space-y-3 px-5 pb-4 text-[13px] leading-relaxed">
            <p>
              {answers.allergies.length ? (
                <>
                  Menu {name} tidak memuat: <b>{answers.allergies.map((x) => ALLERGY_LABEL[x]).join(", ")}</b>.
                </>
              ) : (
                <>{name} tidak punya alergi yang diketahui.</>
              )}
            </p>
            <p className="text-muted">Alergen umum (telur, ikan, susu, gandum, kedelai) diperkenalkan satu per satu saat sarapan, dengan jeda minimal 3 hari, supaya reaksi mudah dikenali.</p>
          </div>
        )}
        {sheet && typeof sheet === "object" && (
          <div>
            <div className="flex flex-col items-center px-5 pb-4 text-center">
              <RecipePlate recipeId={sheet.meal.recipeId} size={170} />
              <p className="mt-4 text-xs font-medium text-teal-600">{MEAL_LABEL[sheet.meal.label]}</p>
              <p className="text-xl font-bold">{RECIPE_MAP[sheet.meal.recipeId]?.name}</p>
            </div>
            <RecipeBody recipeId={sheet.meal.recipeId} stage={sheet.stage} newAllergen={sheet.meal.newAllergen} />
          </div>
        )}
      </Sheet>
    </main>
  );
}

function Building({ a, stage, date, onDone }: { a: QuizAnswers; stage: Stage; date: string; onDone: () => void }) {
  const [msg, setMsg] = useState(0);
  const steps = [
    `Menghitung usia ${a.name}: ${ageLabel(a.dob, date)}`,
    `Menyesuaikan tekstur: ${STAGE_LABEL[stage].toLowerCase()}`,
    a.allergies.length ? `Menghindari ${a.allergies.map((x) => ALLERGY_LABEL[x]).join(", ")}` : "Menjadwalkan pengenalan alergen",
    "Memastikan protein hewani setiap hari",
    "Memilih resep paling sesuai profil & usianya",
    "Menyeimbangkan gizi harian: energi, protein, zat besi",
  ];
  useEffect(() => {
    const t = setInterval(() => setMsg((m) => m + 1), 1200);
    const done = setTimeout(onDone, 6400);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, [onDone]);
  const plates = ["x_carrotsoup", "x_spinachsoup", "x_steamedrice", "d_fruitbowl", "x_pumpkinsoup"];
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <div className="relative h-56 w-56">
        <motion.div className="absolute inset-0 rounded-full border-2 border-dashed border-teal-100" animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }} />
        <AnimatePresence mode="wait">
          <motion.div key={msg % plates.length} initial={{ scale: 0.6, opacity: 0, rotate: -40 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.6, opacity: 0, rotate: 40 }} transition={{ duration: 0.5, ease: IOS_EASE }} className="absolute left-6 top-6">
            <Plate k={plates[msg % plates.length]} size={176} />
          </motion.div>
        </AnimatePresence>
      </div>
      <h1 className="mt-8 text-xl font-bold">Menyusun menu {a.name}…</h1>
      <ul className="mt-6 w-full space-y-3 text-left text-sm">
        {steps.map((s, k) => (
          <motion.li key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: k <= msg ? 1 : 0.3, x: 0 }} transition={{ delay: k * 0.08 }} className="flex items-center gap-3">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${k < msg ? "bg-teal-500 text-white" : "bg-teal-50"}`}>{k < msg && <IconCheck className="h-3.5 w-3.5" />}</span>
            {s}
          </motion.li>
        ))}
      </ul>
    </main>
  );
}
