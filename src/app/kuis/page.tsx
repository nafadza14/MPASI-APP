"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { IconBack, IconCheck } from "@/components/icons";
import { store, track } from "@/lib/client";
import { addMonths, ageInMonths, todayJakarta } from "@/lib/generator";
import type { QuizAnswers } from "@/lib/types";

type Opt = { v: string; label: string; emoji: string; hint?: string };
type Step =
  | { key: "name"; type: "text"; title: string; sub?: string }
  | { key: "dob"; type: "date"; title: string; sub?: string }
  | { key: keyof QuizAnswers; type: "single" | "multi"; title: string; sub?: string; options: Opt[]; none?: string; optional?: boolean };

const STEPS: Step[] = [
  { key: "name", type: "text", title: "Siapa nama panggilan si kecil?", sub: "Nama ini muncul di menu personalnya." },
  { key: "dob", type: "date", title: "Kapan tanggal lahirnya?", sub: "Dipakai untuk menghitung usia tepat dan tahap tekstur." },
  {
    key: "started",
    type: "single",
    title: "Sudah mulai MPASI?",
    options: [
      { v: "belum", label: "Belum, akan mulai", emoji: "🌱" },
      { v: "baru", label: "Baru mulai (< 1 bulan)", emoji: "🥄" },
      { v: "lanjut", label: "Sudah lebih dari 1 bulan", emoji: "🍽️" },
    ],
  },
  {
    key: "texture",
    type: "single",
    title: "Tekstur apa yang sudah bisa dimakan?",
    options: [
      { v: "pure", label: "Pure halus", emoji: "🥣", hint: "Disaring / diblender halus" },
      { v: "lumat", label: "Lumat kental", emoji: "🥄", hint: "Masih ada sedikit gumpalan" },
      { v: "cincang", label: "Cincang halus", emoji: "🔪", hint: "Nasi tim, potongan kecil" },
      { v: "finger", label: "Finger food", emoji: "✋", hint: "Sudah bisa genggam & lumat" },
      { v: "keluarga", label: "Makanan keluarga", emoji: "🍛", hint: "Dipotong kecil-kecil" },
    ],
  },
  {
    key: "allergies",
    type: "multi",
    title: "Ada alergi atau pantangan?",
    sub: "Menu tidak akan memuat bahan yang dipilih.",
    none: "Tidak ada",
    options: [
      { v: "telur", label: "Telur", emoji: "🥚" },
      { v: "susu", label: "Susu sapi & olahannya", emoji: "🧀" },
      { v: "ikan", label: "Ikan", emoji: "🐟" },
      { v: "seafood", label: "Udang & seafood", emoji: "🦐" },
      { v: "kacang", label: "Kacang", emoji: "🥜" },
      { v: "kedelai", label: "Kedelai (tahu, tempe)", emoji: "🫘" },
      { v: "gandum", label: "Gandum (mie, roti)", emoji: "🍞" },
    ],
  },
  {
    key: "concern",
    type: "single",
    title: "Apa kekhawatiran utama Bunda?",
    options: [
      { v: "bingung", label: "Bingung menu tiap hari", emoji: "🤔" },
      { v: "bb", label: "Berat badan", emoji: "⚖️" },
      { v: "gtm", label: "Sering GTM / menolak makan", emoji: "🙅" },
      { v: "alergi", label: "Takut alergi", emoji: "⚠️" },
      { v: "waktu", label: "Tidak punya banyak waktu", emoji: "⏰" },
    ],
  },
  {
    key: "proteins",
    type: "multi",
    title: "Protein hewani apa yang mudah Bunda dapat?",
    sub: "Pilih semua yang sesuai.",
    options: [
      { v: "ayam", label: "Ayam", emoji: "🍗" },
      { v: "hati", label: "Hati ayam / sapi", emoji: "🫀" },
      { v: "ikan", label: "Ikan", emoji: "🐟" },
      { v: "telur", label: "Telur", emoji: "🥚" },
      { v: "sapi", label: "Daging sapi", emoji: "🥩" },
      { v: "udang", label: "Udang", emoji: "🦐" },
    ],
  },
  {
    key: "budget",
    type: "single",
    title: "Budget belanja MPASI per minggu?",
    options: [
      { v: "hemat", label: "Di bawah Rp 100 ribu", emoji: "💰" },
      { v: "sedang", label: "Rp 100–200 ribu", emoji: "💰💰" },
      { v: "longgar", label: "Di atas Rp 200 ribu", emoji: "💰💰💰" },
    ],
  },
  {
    key: "cookMode",
    type: "single",
    title: "Bunda biasanya memasak kapan?",
    options: [
      { v: "harian", label: "Masak setiap hari", emoji: "🍳", hint: "Menu segar tiap hari" },
      { v: "mealprep", label: "Masak sekaligus (meal prep)", emoji: "🧊", hint: "Masak tiap 3 hari, simpan di kulkas/freezer" },
    ],
  },
  {
    key: "tools",
    type: "multi",
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

  const valid = useMemo(() => {
    const v = a[step.key as keyof QuizAnswers];
    if (step.type === "text") return typeof v === "string" && v.trim().length >= 2;
    if (step.type === "date") return typeof v === "string" && age !== null && age >= 2 && age < 24;
    if (step.type === "single") return typeof v === "string";
    if (step.key === "allergies") return noneAllergy || (Array.isArray(v) && v.length > 0);
    if ("optional" in step && step.optional) return true;
    return Array.isArray(v) && v.length > 0;
  }, [a, step, age, noneAllergy]);

  function next() {
    let n = i + 1;
    if (STEPS[n]?.key === "texture" && a.started === "belum") {
      setA((x) => ({ ...x, texture: "pure" }));
      n++;
    }
    const merged = { ...a, ...(a.started === "belum" ? { texture: "pure" as const } : {}) };
    store.setAnswers(merged);
    track("QuizStep", { step: i + 1 });
    if (n >= STEPS.length) {
      router.push("/hasil?baru=1");
    } else setI(n);
  }
  function back() {
    if (i === 0) return router.push("/");
    let n = i - 1;
    if (STEPS[n]?.key === "texture" && a.started === "belum") n--;
    setI(n);
  }
  function toggle(key: keyof QuizAnswers, v: string) {
    setA((x) => {
      const cur = (x[key] as string[]) ?? [];
      return { ...x, [key]: cur.includes(v) ? cur.filter((y) => y !== v) : [...cur, v] };
    });
  }

  return (
    <main className="flex min-h-dvh flex-col px-5 pb-6 pt-4">
      <header className="flex items-center gap-3">
        <button onClick={back} className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas" aria-label="Kembali">
          <IconBack />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-teal-50">
          <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${((i + 1) / STEPS.length) * 100}%` }} />
        </div>
        <span className="w-10 text-right text-xs text-muted">
          {i + 1}/{STEPS.length}
        </span>
      </header>

      <section className="mt-8 flex-1">
        <h1 className="text-[22px] font-bold leading-snug">{step.title.replace("si kecil", a.name && i > 0 ? a.name : "si kecil")}</h1>
        {step.sub && <p className="mt-2 text-sm text-muted">{step.sub}</p>}

        <div className="mt-6 space-y-3">
          {step.type === "text" && (
            <input
              autoFocus
              value={a.name ?? ""}
              onChange={(e) => setA({ ...a, name: e.target.value.slice(0, 30) })}
              onKeyDown={(e) => e.key === "Enter" && valid && next()}
              placeholder="Contoh: Alya"
              className="w-full rounded-2xl border-2 border-line bg-canvas px-4 py-4 text-base outline-none focus:border-teal-500"
            />
          )}
          {step.type === "date" && (
            <>
              <input
                type="date"
                value={a.dob ?? ""}
                max={today}
                min={addMonths(today, -24)}
                onChange={(e) => setA({ ...a, dob: e.target.value })}
                className="w-full rounded-2xl border-2 border-line bg-canvas px-4 py-4 text-base outline-none focus:border-teal-500"
              />
              {age !== null && age >= 2 && age < 24 && (
                <p className="rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-700">
                  Usia {a.name || "si kecil"} sekarang <b>{age} bulan</b>.
                  {age < 6 && ` WHO menganjurkan MPASI dimulai di usia 6 bulan, jadi menunya akan dimulai tepat saat ${a.name || "si kecil"} genap 6 bulan.`}
                </p>
              )}
              {age !== null && (age < 2 || age >= 24) && <p className="text-sm text-orange-600">Menu ini untuk usia 6–24 bulan.</p>}
            </>
          )}
          {(step.type === "single" || step.type === "multi") && (
            <>
              {"none" in step && step.none && (
                <OptionRow
                  opt={{ v: "none", label: step.none, emoji: "✅" }}
                  active={noneAllergy}
                  onClick={() => {
                    setNoneAllergy(!noneAllergy);
                    setA({ ...a, allergies: [] });
                  }}
                />
              )}
              {step.options.map((o) => {
                const v = a[step.key];
                const active = step.type === "single" ? v === o.v : Array.isArray(v) && (v as string[]).includes(o.v);
                return (
                  <OptionRow
                    key={o.v}
                    opt={o}
                    active={active}
                    onClick={() => {
                      if (step.type === "single") setA({ ...a, [step.key]: o.v });
                      else {
                        if (step.key === "allergies") setNoneAllergy(false);
                        toggle(step.key, o.v);
                      }
                    }}
                  />
                );
              })}
            </>
          )}
        </div>
      </section>

      <Button className="mt-6" disabled={!valid} onClick={next}>
        {i === STEPS.length - 1 ? "Susun menu si kecil" : "Lanjut"}
      </Button>
    </main>
  );
}

function OptionRow({ opt, active, onClick }: { opt: Opt; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition ${active ? "border-teal-500 bg-teal-50" : "border-line bg-white"}`}
    >
      <span className="text-2xl" aria-hidden>
        {opt.emoji}
      </span>
      <span className="flex-1">
        <span className="block text-[15px] font-medium">{opt.label}</span>
        {opt.hint && <span className="block text-xs text-muted">{opt.hint}</span>}
      </span>
      <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${active ? "border-teal-500 bg-teal-500 text-white" : "border-line"}`}>
        {active && <IconCheck className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
