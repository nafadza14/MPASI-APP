"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Button, TopBar } from "@/components/ui";
import { Photo } from "@/components/Img";
import { IconCheck } from "@/components/icons";
import { IOS_EASE } from "@/components/motion";
import { markBack } from "@/components/navdir";
import { store, track } from "@/lib/client";
import { addMonths, ageInMonths, todayJakarta } from "@/lib/generator";
import type { QuizAnswers } from "@/lib/types";

type Opt = { v: string; label: string; photo?: string; emoji?: string; hint?: string };
type Step =
  | { key: "profile"; type: "profile"; title: string; sub?: string }
  | { key: keyof QuizAnswers; type: "single" | "multi"; layout?: "grid" | "list"; title: string; sub?: string; options: Opt[]; none?: string; optional?: boolean };

const STEPS: Step[] = [
  { key: "profile", type: "profile", title: "Siapa nama dan usia si kecil?", sub: "Dipakai untuk menghitung tahap tekstur dan porsi." },
  {
    key: "started",
    type: "single",
    layout: "list",
    title: "Sudah mulai MPASI?",
    options: [
      { v: "belum", label: "Belum, akan mulai", photo: "h_highchair", hint: "Menu dimulai dari pengenalan" },
      { v: "baru", label: "Baru mulai", photo: "h_babyeat", hint: "Kurang dari 1 bulan" },
      { v: "lanjut", label: "Sudah lancar", photo: "h_babyeat2", hint: "Lebih dari 1 bulan" },
    ],
  },
  {
    key: "texture",
    type: "single",
    layout: "grid",
    title: "Tekstur apa yang sudah bisa dimakan?",
    options: [
      { v: "pure", label: "Pure halus", photo: "x_carrotsoup" },
      { v: "lumat", label: "Lumat kental", photo: "x_mashed" },
      { v: "cincang", label: "Cincang / nasi tim", photo: "x_steamedrice" },
      { v: "finger", label: "Finger food", photo: "d_vegsteam" },
      { v: "keluarga", label: "Makanan keluarga", photo: "d_ricebowl" },
    ],
  },
  {
    key: "allergies",
    type: "multi",
    layout: "grid",
    title: "Ada alergi atau pantangan?",
    sub: "Menu tidak akan memuat bahan yang dipilih.",
    none: "Tidak ada alergi",
    options: [
      { v: "telur", label: "Telur", photo: "egg" },
      { v: "susu", label: "Susu sapi", photo: "cheese" },
      { v: "ikan", label: "Ikan", photo: "mackerel" },
      { v: "seafood", label: "Udang", photo: "shrimp" },
      { v: "kedelai", label: "Kedelai", photo: "tofu" },
      { v: "gandum", label: "Gandum", photo: "bread" },
      { v: "kacang", label: "Kacang", emoji: "🥜" },
    ],
  },
  {
    key: "proteins",
    type: "multi",
    layout: "grid",
    title: "Protein hewani apa yang mudah didapat?",
    sub: "Pilih semua yang sesuai.",
    options: [
      { v: "ayam", label: "Ayam", photo: "chicken" },
      { v: "hati", label: "Hati", photo: "liver" },
      { v: "ikan", label: "Ikan", photo: "mackerel" },
      { v: "telur", label: "Telur", photo: "egg" },
      { v: "sapi", label: "Daging sapi", photo: "beef" },
      { v: "udang", label: "Udang", photo: "shrimp" },
    ],
  },
  {
    key: "concern",
    type: "single",
    layout: "list",
    title: "Apa kekhawatiran utama Bunda?",
    options: [
      { v: "bingung", label: "Bingung menu tiap hari", emoji: "🤔" },
      { v: "bb", label: "Berat badan si kecil", emoji: "⚖️" },
      { v: "gtm", label: "Sering GTM / menolak makan", emoji: "🙅" },
      { v: "alergi", label: "Takut alergi", emoji: "⚠️" },
      { v: "waktu", label: "Tidak punya banyak waktu", emoji: "⏰" },
    ],
  },
  {
    key: "budget",
    type: "single",
    layout: "list",
    title: "Budget belanja MPASI per minggu?",
    options: [
      { v: "hemat", label: "Di bawah Rp 100 ribu", emoji: "💰" },
      { v: "sedang", label: "Rp 100–200 ribu", emoji: "💵" },
      { v: "longgar", label: "Di atas Rp 200 ribu", emoji: "💳" },
    ],
  },
  {
    key: "cookMode",
    type: "single",
    layout: "list",
    title: "Bunda biasanya memasak kapan?",
    options: [
      { v: "harian", label: "Masak setiap hari", photo: "d_vegsteam", hint: "Menu segar tiap hari" },
      { v: "mealprep", label: "Masak sekaligus (meal prep)", photo: "x_riceporridge", hint: "Masak tiap 3 hari, simpan di kulkas/freezer" },
    ],
  },
  {
    key: "tools",
    type: "multi",
    layout: "list",
    title: "Alat apa yang ada di rumah?",
    sub: "Boleh dilewati.",
    optional: true,
    options: [
      { v: "blender", label: "Blender / chopper", emoji: "🌀" },
      { v: "kukusan", label: "Kukusan", emoji: "♨️" },
      { v: "slowcooker", label: "Slow cooker", emoji: "🍲" },
      { v: "freezer", label: "Freezer", emoji: "🧊" },
    ],
  },
];

export default function Quiz() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [a, setA] = useState<Partial<QuizAnswers>>({ allergies: [], proteins: [], tools: [] });
  const [noneAllergy, setNoneAllergy] = useState(false);

  useEffect(() => {
    const saved = store.getAnswers();
    if (saved) setA((x) => ({ ...x, ...saved }));
    track("QuizStart");
  }, []);

  const step = STEPS[i];
  const today = todayJakarta();
  const age = a.dob ? ageInMonths(a.dob, today) : null;
  const ageOk = age !== null && age >= 2 && age < 24;

  const valid = useMemo(() => {
    if (step.type === "profile") return (a.name ?? "").trim().length >= 2 && ageOk;
    const v = a[step.key];
    if (step.type === "single") return typeof v === "string";
    if (step.key === "allergies") return noneAllergy || (Array.isArray(v) && v.length > 0);
    if (step.optional) return true;
    return Array.isArray(v) && v.length > 0;
  }, [a, step, ageOk, noneAllergy]);

  const skipTexture = a.started === "belum";
  function next() {
    let n = i + 1;
    if (STEPS[n]?.key === "texture" && skipTexture) n++;
    const merged = { ...a, ...(skipTexture ? { texture: "pure" as const } : {}) };
    setA(merged);
    store.setAnswers(merged);
    track("QuizStep", { step: i + 1 });
    if (n >= STEPS.length) return router.push("/hasil?baru=1");
    setDir(1);
    setI(n);
  }
  function back() {
    if (i === 0) {
      markBack();
      return router.push("/");
    }
    let n = i - 1;
    if (STEPS[n]?.key === "texture" && skipTexture) n--;
    setDir(-1);
    setI(n);
  }
  function toggle(key: keyof QuizAnswers, v: string) {
    setA((x) => {
      const cur = (x[key] as string[]) ?? [];
      return { ...x, [key]: cur.includes(v) ? cur.filter((y) => y !== v) : [...cur, v] };
    });
  }
  const isActive = (o: Opt) => {
    if (step.type === "profile") return false;
    const v = a[step.key];
    return step.type === "single" ? v === o.v : Array.isArray(v) && (v as string[]).includes(o.v);
  };
  const choose = (o: Opt) => {
    if (step.type === "profile") return;
    if (step.type === "single") setA({ ...a, [step.key]: o.v });
    else {
      if (step.key === "allergies") setNoneAllergy(false);
      toggle(step.key, o.v);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col">
      <TopBar onBack={back} title={`Langkah ${i + 1} dari ${STEPS.length}`} />
      <div className="mx-5 h-1.5 overflow-hidden rounded-full bg-teal-50">
        <motion.div className="h-full rounded-full bg-teal-500" animate={{ width: `${((i + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.5, ease: IOS_EASE }} />
      </div>

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.section
            key={i}
            custom={dir}
            variants={{ enter: (d: number) => ({ x: d > 0 ? "100%" : "-35%", opacity: d > 0 ? 1 : 0.4 }), center: { x: 0, opacity: 1 }, exit: (d: number) => ({ x: d > 0 ? "-35%" : "100%", opacity: d > 0 ? 0.4 : 1 }) }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: IOS_EASE }}
            className="px-5 pb-6 pt-7"
          >
            <h1 className="text-[23px] font-bold leading-snug">{step.title.replace("si kecil", a.name && i > 0 ? a.name : "si kecil")}</h1>
            {step.sub && <p className="mt-2 text-sm text-muted">{step.sub}</p>}

            {step.type === "profile" && (
              <div className="mt-7 space-y-5">
                <Field label="Nama panggilan">
                  <input value={a.name ?? ""} onChange={(e) => setA({ ...a, name: e.target.value.slice(0, 30) })} placeholder="Contoh: Alya" className="w-full bg-transparent outline-none" />
                </Field>
                <Field label="Tanggal lahir">
                  <input type="date" value={a.dob ?? ""} max={today} min={addMonths(today, -24)} onChange={(e) => setA({ ...a, dob: e.target.value })} className="w-full bg-transparent outline-none" />
                </Field>
                <div>
                  <p className="mb-2 text-xs font-medium text-muted">Jenis kelamin</p>
                  <div className="flex gap-6">
                    {(
                      [
                        ["p", "Perempuan"],
                        ["l", "Laki-laki"],
                      ] as const
                    ).map(([v, l]) => (
                      <button key={v} onClick={() => setA({ ...a, gender: v })} className="flex items-center gap-2 text-sm">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${a.gender === v ? "border-teal-500" : "border-line"}`}>{a.gender === v && <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />}</span>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {age !== null && (
                  <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl px-4 py-3 text-sm ${ageOk ? "bg-teal-50 text-teal-700" : "bg-orange-50 text-orange-700"}`}>
                    {ageOk ? (
                      <>
                        Usia {a.name || "si kecil"} sekarang <b>{age} bulan</b>.{age < 6 && ` Menu akan dimulai tepat saat genap 6 bulan, sesuai anjuran WHO.`}
                      </>
                    ) : (
                      "Menu ini untuk usia 6–24 bulan."
                    )}
                  </motion.p>
                )}
              </div>
            )}

            {step.type !== "profile" && step.layout === "grid" && (
              <div className="mt-6 grid grid-cols-3 gap-3">
                {step.none && (
                  <GridOpt opt={{ v: "none", label: step.none, emoji: "✅" }} active={noneAllergy} onClick={() => { setNoneAllergy(!noneAllergy); setA({ ...a, allergies: [] }); }} />
                )}
                {step.options.map((o) => (
                  <GridOpt key={o.v} opt={o} active={isActive(o)} onClick={() => choose(o)} />
                ))}
              </div>
            )}
            {step.type !== "profile" && step.layout === "list" && (
              <div className="mt-6 space-y-3">
                {step.options.map((o) => (
                  <ListOpt key={o.v} opt={o} active={isActive(o)} onClick={() => choose(o)} />
                ))}
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>

      <div className="sticky bottom-0 bg-white px-5 pb-6 pt-3">
        <Button disabled={!valid} onClick={next}>
          {i === STEPS.length - 1 ? "Susun menu si kecil" : "Lanjut"}
        </Button>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-muted">{label}</span>
      <span className="block rounded-[16px] border border-line bg-[#f7f8fa] px-4 py-3.5 text-[15px] focus-within:border-teal-500 focus-within:bg-white">{children}</span>
    </label>
  );
}

function Check({ on }: { on: boolean }) {
  return (
    <motion.span animate={{ scale: on ? 1 : 0.6, opacity: on ? 1 : 0 }} className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white shadow">
      <IconCheck className="h-3.5 w-3.5" />
    </motion.span>
  );
}

function GridOpt({ opt, active, onClick }: { opt: Opt; active: boolean; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.94 }} onClick={onClick} className={`relative flex flex-col items-center gap-2 rounded-[22px] border-2 p-3 pt-4 transition ${active ? "border-teal-500 bg-teal-50" : "border-transparent bg-[#f7f8fa]"}`}>
      {opt.photo ? <Photo k={opt.photo} w={60} round className="h-[60px] w-[60px] ring-4 ring-white" /> : <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white text-3xl">{opt.emoji}</span>}
      <span className="text-center text-[12px] font-medium leading-tight">{opt.label}</span>
      <span className="absolute right-1.5 top-1.5">
        <Check on={active} />
      </span>
    </motion.button>
  );
}

function ListOpt({ opt, active, onClick }: { opt: Opt; active: boolean; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} className={`flex w-full items-center gap-3 rounded-[22px] border-2 p-2.5 pr-4 text-left transition ${active ? "border-teal-500 bg-teal-50" : "border-transparent bg-[#f7f8fa]"}`}>
      {opt.photo ? <Photo k={opt.photo} w={56} className="h-14 w-14 shrink-0 rounded-[16px]" /> : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-white text-2xl">{opt.emoji}</span>}
      <span className="flex-1">
        <span className="block text-[15px] font-medium">{opt.label}</span>
        {opt.hint && <span className="block text-xs text-muted">{opt.hint}</span>}
      </span>
      <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${active ? "border-teal-500 bg-teal-500 text-white" : "border-line bg-white"}`}>{active && <IconCheck className="h-3.5 w-3.5" />}</span>
    </motion.button>
  );
}
