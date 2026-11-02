"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Dots, LinkButton } from "@/components/ui";
import { Photo, Plate } from "@/components/Img";
import { Sheet } from "@/components/motion";
import { FoodRow } from "@/components/food";
import { store } from "@/lib/client";
import { RECIPES } from "@/lib/recipes";

const SLIDES = [
  { photo: "h_babyeat", float: ["carrot", "spinach", "chicken"], title: "Menu MPASI yang pas untuk si kecil", sub: "Disusun dari usia, tekstur, dan alergi anak Bunda — bukan template yang sama untuk semua." },
  { photo: "x_carrotsoup", plate: true, float: ["pumpkin", "egg", "broccoli"], title: `${Math.floor(RECIPES.length / 100) * 100}+ variasi resep rumahan`, sub: "Bahan pasar, takaran per porsi, tekstur naik bertahap sesuai panduan WHO & IDAI." },
  { photo: "h_highchair", float: ["avocado", "banana", "salmon"], title: "Lihat 3 hari pertama gratis", sub: "Kalau cocok, buka 30 hari dengan sekali bayar QRIS. Garansi uang kembali 7 hari." },
];

const SAMPLE = [
  RECIPES.find((r) => r.family === "bubur" && r.protein === "hati")!.id,
  RECIPES.find((r) => r.family === "pure-buah" && r.name.includes("Alpukat"))!.id,
  RECIPES.find((r) => r.family === "bubur" && r.protein === "ikan" && r.name.includes("Labu"))!.id,
];

export default function Onboarding() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [sample, setSample] = useState(false);
  const [hasToken, setHasToken] = useState<string | null>(null);

  useEffect(() => {
    store.captureUtm();
    setHasToken(store.getToken());
  }, []);
  useEffect(() => {
    const t = setTimeout(() => go(1), 4500);
    return () => clearTimeout(t);
  });
  function go(d: number) {
    setDir(d);
    setI((x) => (x + d + SLIDES.length) % SLIDES.length);
  }
  const s = SLIDES[i];

  return (
    <main className="flex min-h-dvh flex-col px-6 pb-6 pt-5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold tracking-wide text-teal-600">flouris care · MPASI</span>
        <button onClick={() => setSample(true)} className="text-muted">
          Contoh menu
        </button>
      </div>

      <div className="relative mt-4 flex flex-1 flex-col items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.div
            key={i}
            custom={dir}
            variants={{ enter: (d: number) => ({ x: d * 260, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d: number) => ({ x: d * -260, opacity: 0 }) }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => (info.offset.x < -60 ? go(1) : info.offset.x > 60 ? go(-1) : null)}
            className="flex w-full cursor-grab flex-col items-center text-center active:cursor-grabbing"
          >
            <div className="relative h-[290px] w-[290px]">
              <div className="absolute inset-3 rounded-full bg-teal-50" />
              <div className="absolute inset-0 rounded-full border border-dashed border-teal-100" />
              {s.plate ? <Plate k={s.photo} size={230} className="absolute left-[30px] top-[30px]" /> : <Photo k={s.photo} w={230} round eager className="absolute left-[30px] top-[30px] h-[230px] w-[230px] ring-8 ring-white" />}
              {s.float.map((f, k) => (
                <motion.div
                  key={f}
                  className="absolute"
                  style={[{ left: -4, top: 40 }, { right: -6, top: 70 }, { left: 18, bottom: 6 }][k]}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3 + k * 0.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Photo k={f} w={k === 1 ? 70 : 58} round className={`${k === 1 ? "h-[70px] w-[70px]" : "h-[58px] w-[58px]"} shadow-[0_10px_24px_rgba(29,36,51,0.18)] ring-4 ring-white`} />
                </motion.div>
              ))}
            </div>
            <h1 className="mt-8 px-2 text-[25px] font-bold leading-tight">{s.title}</h1>
            <p className="mt-3 px-3 text-[13.5px] leading-relaxed text-muted">{s.sub}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-6">
          <Dots n={SLIDES.length} active={i} />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <div className="w-[42%]">
          <LinkButton href={hasToken ? `/m/${hasToken}` : "/masuk"} variant="outline">
            Masuk
          </LinkButton>
        </div>
        <LinkButton href="/kuis">Mulai Gratis</LinkButton>
      </div>
      <p className="mt-4 text-center text-[11px] text-muted">
        Panduan WHO & IDAI · <Link href="/privasi">Privasi</Link> · <Link href="/syarat">Syarat</Link> · <Link href="/refund">Garansi</Link>
      </p>

      <Sheet open={sample} onClose={() => setSample(false)} title="Contoh menu satu hari">
        <div className="space-y-3 px-5 pb-4">
          {SAMPLE.map((id, k) => (
            <FoodRow key={id} recipeId={id} label={["Sarapan", "Snack", "Makan siang"][k]} onClick={() => setSample(false)} />
          ))}
          <p className="pt-2 text-center text-xs text-muted">Menu Bunda akan berbeda — disusun dari jawaban kuis.</p>
          <LinkButton href="/kuis">Susun menu si kecil</LinkButton>
        </div>
      </Sheet>
    </main>
  );
}
