import type { Allergen, Ingredient, Protein, Recipe, Stage } from "./types";

/**
 * DATABASE RESEP — DRAF, WAJIB DITINJAU AHLI GIZI SEBELUM DIJUAL.
 *
 * Resep disusun dari kombinasi bahan (protein × sayur × karbohidrat × cara olah) supaya
 * setiap anak mendapat menu yang berbeda-beda. Takaran = porsi tahap 1 (6–8 bulan);
 * tahap 2 dikali 1,3 dan tahap 3 dikali 1,6 (scaleQty). Tidak ada angka gizi yang dikarang.
 */

// ───────────── Katalog bahan ─────────────
type Ing = { name: string; short: string; photo: string; group: Ingredient["group"]; allergen?: Allergen; protein?: Protein; color?: "orange" | "green" | "red" | "purple" | "white" | "yellow"; cost?: 1 | 2 | 3; iron?: boolean };

export const ING: Record<string, Ing> = {
  // protein hewani
  ayam: { name: "Daging ayam fillet", short: "Ayam", photo: "chicken", group: "protein", protein: "ayam", cost: 1 },
  ayampaha: { name: "Daging ayam paha fillet", short: "Ayam Paha", photo: "chicken", group: "protein", protein: "ayam", cost: 1 },
  hatiayam: { name: "Hati ayam", short: "Hati Ayam", photo: "liver", group: "protein", protein: "hati", cost: 1, iron: true },
  hatisapi: { name: "Hati sapi", short: "Hati Sapi", photo: "beefliver", group: "protein", protein: "hati", cost: 2, iron: true },
  sapi: { name: "Daging sapi giling", short: "Daging Sapi", photo: "beef", group: "protein", protein: "sapi", cost: 2, iron: true },
  kembung: { name: "Ikan kembung fillet", short: "Ikan Kembung", photo: "pkembung", group: "protein", protein: "ikan", allergen: "ikan", cost: 1 },
  nila: { name: "Ikan nila fillet", short: "Ikan Nila", photo: "tilapia", group: "protein", protein: "ikan", allergen: "ikan", cost: 1 },
  salmon: { name: "Salmon fillet", short: "Salmon", photo: "salmon", group: "protein", protein: "ikan", allergen: "ikan", cost: 3 },
  dori: { name: "Ikan dori fillet", short: "Ikan Dori", photo: "dory", group: "protein", protein: "ikan", allergen: "ikan", cost: 2 },
  teri: { name: "Ikan teri nasi (rendam & bilas)", short: "Teri", photo: "anchovy", group: "protein", protein: "ikan", allergen: "ikan", cost: 1, iron: true },
  udang: { name: "Udang kupas", short: "Udang", photo: "shrimp", group: "protein", protein: "udang", allergen: "seafood", cost: 2 },
  telur: { name: "Telur ayam", short: "Telur", photo: "egg", group: "protein", protein: "telur", allergen: "telur", cost: 1 },
  // protein nabati
  tahu: { name: "Tahu putih", short: "Tahu", photo: "tofu", group: "protein", allergen: "kedelai", cost: 1 },
  tempe: { name: "Tempe", short: "Tempe", photo: "tempeh", group: "protein", allergen: "kedelai", cost: 1 },
  // karbohidrat
  beras: { name: "Beras putih", short: "", photo: "rice", group: "karbo", color: "white", cost: 1 },
  berasmerah: { name: "Beras merah", short: "Beras Merah", photo: "brownrice", group: "karbo", cost: 1 },
  nasi: { name: "Nasi lembek", short: "Nasi", photo: "rice", group: "karbo", cost: 1 },
  kentang: { name: "Kentang", short: "Kentang", photo: "potato", group: "karbo", color: "white", cost: 1 },
  ubi: { name: "Ubi oranye", short: "Ubi", photo: "sweetpotato", group: "karbo", color: "orange", cost: 1 },
  ubiungu: { name: "Ubi ungu", short: "Ubi Ungu", photo: "pubiungu", group: "karbo", color: "purple", cost: 1 },
  oat: { name: "Oat (rolled oats)", short: "Oat", photo: "oats", group: "karbo", allergen: "gandum", cost: 2 },
  makaroni: { name: "Makaroni kecil", short: "Makaroni", photo: "macaroni", group: "karbo", allergen: "gandum", cost: 1 },
  mie: { name: "Mie telur", short: "Mie", photo: "noodles", group: "karbo", allergen: "gandum", cost: 1 },
  roti: { name: "Roti tawar", short: "Roti", photo: "bread", group: "karbo", allergen: "gandum", cost: 1 },
  // sayur
  wortel: { name: "Wortel", short: "Wortel", photo: "carrot", group: "sayur", color: "orange" },
  bayam: { name: "Bayam (daun)", short: "Bayam", photo: "spinach", group: "sayur", color: "green", iron: true },
  bayammerah: { name: "Bayam merah", short: "Bayam Merah", photo: "redspinach", group: "sayur", color: "red", iron: true },
  brokoli: { name: "Brokoli", short: "Brokoli", photo: "broccoli", group: "sayur", color: "green" },
  labukuning: { name: "Labu kuning", short: "Labu Kuning", photo: "pumpkin", group: "sayur", color: "orange" },
  labusiam: { name: "Labu siam", short: "Labu Siam", photo: "plabusiam", group: "sayur", color: "green" },
  buncis: { name: "Buncis", short: "Buncis", photo: "greenbeans", group: "sayur", color: "green" },
  kacangpanjang: { name: "Kacang panjang", short: "Kacang Panjang", photo: "pkacangpanjang", group: "sayur", color: "green" },
  jagung: { name: "Jagung manis pipil", short: "Jagung", photo: "corn", group: "sayur", color: "yellow" },
  tomat: { name: "Tomat (buang biji & kulit)", short: "Tomat", photo: "tomato", group: "sayur", color: "red" },
  sawi: { name: "Sawi / pakcoy", short: "Pakcoy", photo: "bokchoy", group: "sayur", color: "green" },
  zucchini: { name: "Zucchini / oyong", short: "Zucchini", photo: "zucchini", group: "sayur", color: "green" },
  kembangkol: { name: "Kembang kol", short: "Kembang Kol", photo: "cauliflower", group: "sayur", color: "white" },
  jamur: { name: "Jamur kancing", short: "Jamur", photo: "mushroom", group: "sayur", color: "white" },
  // buah
  pisang: { name: "Pisang ambon matang", short: "Pisang", photo: "banana", group: "buah" },
  alpukat: { name: "Alpukat matang", short: "Alpukat", photo: "avocado", group: "buah" },
  pepaya: { name: "Pepaya matang", short: "Pepaya", photo: "papaya", group: "buah" },
  mangga: { name: "Mangga matang", short: "Mangga", photo: "mango", group: "buah" },
  melon: { name: "Melon", short: "Melon", photo: "melon", group: "buah" },
  pir: { name: "Pir (kukus)", short: "Pir", photo: "pear", group: "buah" },
  apel: { name: "Apel (kukus)", short: "Apel", photo: "apple", group: "buah" },
  naga: { name: "Buah naga", short: "Buah Naga", photo: "dragonfruit", group: "buah" },
  // lemak & bumbu
  minyak: { name: "Minyak zaitun", short: "Minyak Zaitun", photo: "oliveoil", group: "lemak" },
  mentega: { name: "Mentega tawar (unsalted)", short: "Mentega", photo: "butter", group: "lemak", allergen: "susu" },
  santan: { name: "Santan encer", short: "Santan", photo: "coconutmilk", group: "lemak" },
  keju: { name: "Keju cheddar parut", short: "Keju", photo: "cheese", group: "lemak", allergen: "susu" },
  yogurt: { name: "Yogurt plain tanpa gula", short: "Yogurt", photo: "yogurt", group: "protein", allergen: "susu" },
  kaldu: { name: "Kaldu tanpa garam", short: "Kaldu", photo: "broth", group: "lain" },
  bawang: { name: "Bawang putih & merah", short: "Bawang", photo: "garlic", group: "bumbu" },
  kunyit: { name: "Kunyit bubuk / parut", short: "Kunyit", photo: "turmeric", group: "bumbu" },
  terigu: { name: "Tepung terigu", short: "Terigu", photo: "bread", group: "karbo", allergen: "gandum" },
  kecap: { name: "Kecap manis (sedikit)", short: "Kecap", photo: "garlic", group: "bumbu", allergen: "kedelai" },
};

const ing = (key: string, qty: number, unit: Ingredient["unit"] = "g"): Ingredient => ({ key, item: ING[key].name, qty, unit, group: ING[key].group });

// ───────────── Utilitas ─────────────
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const hashIdx = (s: string, n: number) => {
  let h = 0;
  for (let k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) >>> 0;
  return h % n;
};
const pick = <T,>(seed: string, arr: readonly T[]) => arr[hashIdx(seed, arr.length)];
const lc = (k: string) => ING[k].short.toLowerCase() || ING[k].name.toLowerCase();

function build(p: {
  name: string;
  family: string;
  slot: "utama" | "snack";
  stages: Stage[];
  items: Ingredient[];
  steps: string[];
  img: string;
  minutes: number;
  freezable: boolean;
  extraTags?: Recipe["tags"];
}): Recipe {
  const keys = p.items.map((x) => x.key!).filter(Boolean);
  const allergens = [...new Set(keys.map((k) => ING[k]?.allergen).filter(Boolean) as Allergen[])];
  const proteinKey = keys.find((k) => ING[k]?.protein);
  const tags = new Set<Recipe["tags"][number]>(p.extraTags ?? []);
  if (keys.some((k) => ING[k]?.iron)) tags.add("zat-besi");
  if (keys.some((k) => ["santan", "mentega", "keju", "alpukat"].includes(k))) tags.add("lemak-tambahan");
  if (keys.some((k) => ["bayam", "brokoli", "sawi", "bayammerah"].includes(k))) tags.add("sayur-hijau");
  const cost = Math.max(1, ...keys.map((k) => ING[k]?.cost ?? 1)) as 1 | 2 | 3;
  return {
    id: slug(`${p.family}-${p.name}`),
    name: p.name,
    slot: p.slot,
    stages: p.stages,
    ingredients: p.items,
    steps: p.steps,
    allergens,
    protein: proteinKey ? ING[proteinKey].protein! : null,
    tags: [...tags],
    cost,
    minutes: p.minutes,
    freezable: p.freezable,
    img: p.img,
    family: p.family,
  };
}

function soupPhoto(seed: string, vegKey: string, carbKey: string) {
  const c = ING[carbKey]?.color === "purple" ? "purple" : ING[vegKey]?.color;
  const opts: Record<string, string[]> = {
    orange: ["ppuree", "ppuree2", "ppuree3", "x_carrotsoup", "x_pumpkinsoup"],
    yellow: ["ppuree3", "ppuree2", "x_cornsoup"],
    green: ["pporridge", "pporridge2", "x_spinachsoup", "x_peasoup"],
    red: ["pporridge3", "x_tomatosoup"],
    purple: ["x_beetsoup"],
    white: ["pporridge2", "pporridge3", "ppuree", "ppuree2", "x_riceporridge", "x_riceporridge2"],
  };
  return pick(seed, opts[c ?? "white"] ?? opts.white);
}

const fatFor = (seed: string) => pick(seed, ["minyak", "minyak", "santan", "mentega"] as const);
const PROTEIN_PREP: Record<string, string> = {
  ayam: "Rebus ayam hingga matang dan empuk, lalu cincang.",
  ayampaha: "Rebus ayam paha hingga matang dan empuk, buang lemak berlebih, cincang.",
  hatiayam: "Rendam hati ayam dengan air perasan jeruk nipis 10 menit, bilas, rebus hingga matang sempurna (tidak ada bagian merah).",
  hatisapi: "Rebus hati sapi hingga matang sempurna, buang selaputnya, potong kecil.",
  sapi: "Tumis daging giling dengan sedikit lemak hingga berubah warna dan matang.",
  kembung: "Kukus ikan kembung hingga matang, buang semua duri dengan teliti.",
  nila: "Kukus ikan nila hingga matang, buang semua duri dengan teliti.",
  salmon: "Kukus salmon hingga matang, pastikan tidak ada duri.",
  dori: "Kukus ikan dori hingga matang, suwir halus.",
  teri: "Rendam teri dalam air panas 10 menit untuk mengurangi garam, bilas 2–3 kali, rebus.",
  udang: "Buang kepala, kulit, dan kotoran punggung udang, rebus hingga merah dan matang.",
  telur: "Rebus telur 10–12 menit hingga matang penuh (kuning tidak cair).",
  tahu: "Kukus tahu 10 menit.",
  tempe: "Kukus tempe 10–15 menit.",
};

const R: Recipe[] = [];
const seen = new Set<string>();
const add = (r: Recipe) => {
  if (seen.has(r.id)) return;
  seen.add(r.id);
  R.push(r);
};

// ───────────── Tahap 1 (6–8 bln): bubur & pure ─────────────
const P1 = ["ayam", "ayampaha", "hatiayam", "hatisapi", "sapi", "kembung", "nila", "salmon", "dori", "telur"];
const V1 = ["wortel", "bayam", "brokoli", "labukuning", "labusiam", "buncis", "kacangpanjang", "jagung", "tomat", "sawi", "zucchini", "kembangkol", "bayammerah"];
const C1 = ["beras", "berasmerah", "kentang", "ubi", "ubiungu", "oat"];
for (const c of C1)
for (const p of P1)
  for (const v of V1) {
    const seed = c + p + v;
    const fat = fatFor(seed);
    const name = `Bubur ${ING[c].short ? ING[c].short + " " : ""}${p === "telur" ? "Kuning Telur" : ING[p].short} ${ING[v].short}`;
    add(
      build({
        name,
        family: "bubur",
        slot: "utama",
        stages: [1, 2],
        img: soupPhoto(seed, v, c),
        minutes: 35,
        freezable: p !== "telur",
        items: [ing(c, c === "beras" || c === "berasmerah" || c === "oat" ? 20 : 30), p === "telur" ? ing("telur", 1, "butir") : ing(p, 20), ing(v, 15), ing("kaldu", 150, "ml"), ing(fat, 1, fat === "santan" ? "sdm" : "sdt")],
        steps: [
          `Cuci ${lc(c) || "beras"}, masak bersama kaldu hingga sangat lembut.`,
          PROTEIN_PREP[p] + (p === "telur" ? " Ambil kuning telurnya (putih telur bisa diperkenalkan terpisah)." : ""),
          `Masukkan ${lc(v)} yang sudah dipotong kecil, masak hingga empuk.`,
          `Campur semua, saring atau blender hingga kental, tambahkan ${lc(fat)} sebelum disajikan.`,
        ],
      }),
    );
  }

// Bubur dengan tambahan tahu/tempe
for (const p of ["ayam", "hatiayam", "sapi", "kembung", "nila"])
  for (const n of ["tahu", "tempe"])
    for (const v of ["wortel", "bayam", "labusiam", "brokoli", "labukuning"]) {
      const seed = p + n + v;
      add(
        build({
          name: `Bubur ${ING[p].short} ${ING[n].short} ${ING[v].short}`,
          family: "bubur",
          slot: "utama",
          stages: [1, 2],
          img: soupPhoto(seed, v, "beras"),
          minutes: 40,
          freezable: true,
          items: [ing("beras", 20), ing(p, 15), ing(n, 10), ing(v, 15), ing("kaldu", 150, "ml"), ing("minyak", 1, "sdt")],
          steps: [PROTEIN_PREP[n], "Masak beras dengan kaldu hingga lembut.", PROTEIN_PREP[p], `Masukkan ${lc(v)}, masak hingga empuk, lalu haluskan semua sesuai tekstur dan beri minyak.`],
        }),
      );
    }

// ───────────── Tahap 2–3: cara olah beragam ─────────────
const P2 = ["ayam", "ayampaha", "hatiayam", "hatisapi", "sapi", "kembung", "nila", "salmon", "dori", "teri", "udang", "telur"];
const V2 = [...V1, "jamur"];

type Method = {
  family: string;
  name: (p: string, v: string) => string;
  proteins: string[];
  vegs: string[];
  stages: Stage[];
  img: (seed: string, p: string, v: string) => string;
  carb: (seed: string) => string;
  extras: (seed: string) => Ingredient[];
  steps: (p: string, v: string, c: string) => string[];
  minutes: number;
  freezable: boolean;
};

const carbRotate = (seed: string) => pick(seed, ["nasi", "nasi", "nasi", "berasmerah", "kentang", "ubi"]);

const METHODS: Method[] = [
  {
    family: "nasi-tim",
    name: (p, v) => `Nasi Tim ${ING[p].short} ${ING[v].short}`,
    proteins: P2,
    vegs: V2,
    stages: [2, 3],
    img: (s) => pick(s, ["pnasi", "pricebowl", "x_steamedrice", "x_chickenrice"]),
    carb: () => "beras",
    extras: (s) => [ing("bawang", 1, "siung"), ing("kaldu", 120, "ml"), ing(fatFor(s), 1, "sdt")],
    steps: (p, v) => [PROTEIN_PREP[p], "Tumis bawang dengan sedikit lemak hingga harum.", `Masukkan beras, ${lc(p)}, ${lc(v)}, dan kaldu ke wadah tahan panas.`, "Tim (kukus dalam wadah) 40–45 menit hingga nasi lembut, aduk, cincang sesuai kemampuan mengunyah."],
    minutes: 50,
    freezable: true,
  },
  {
    family: "sup",
    name: (p, v) => `Sup ${ING[p].short} ${ING[v].short}`,
    proteins: ["ayam", "ayampaha", "sapi", "dori", "salmon", "udang", "telur", "hatiayam"],
    vegs: ["wortel", "brokoli", "kembangkol", "buncis", "jagung", "labusiam", "sawi", "zucchini", "tomat", "jamur"],
    stages: [2, 3],
    img: (s) => pick(s, ["psop", "psop2", "d_soup"]),
    carb: carbRotate,
    extras: () => [ing("bawang", 1, "siung"), ing("kaldu", 150, "ml"), ing("minyak", 1, "sdt")],
    steps: (p, v, c) => [PROTEIN_PREP[p], "Didihkan kaldu bersama bawang yang sudah digeprek.", `Masukkan ${lc(v)} dan ${lc(p)}, masak hingga sayur sangat empuk.`, `Sajikan dengan ${lc(c)}, potong atau lumatkan sesuai usia.`],
    minutes: 30,
    freezable: true,
  },
  {
    family: "sup-makaroni",
    name: (p, v) => `Sup Makaroni ${ING[p].short} ${ING[v].short}`,
    proteins: ["ayam", "sapi", "dori", "salmon", "udang"],
    vegs: ["wortel", "brokoli", "buncis", "jagung", "kembangkol", "tomat", "sawi"],
    stages: [2, 3],
    img: () => "d_soup",
    carb: () => "makaroni",
    extras: () => [ing("kaldu", 150, "ml"), ing("minyak", 1, "sdt")],
    steps: (p, v) => [PROTEIN_PREP[p], `Didihkan kaldu, masukkan makaroni dan ${lc(v)}.`, `Masak hingga makaroni sangat empuk (lebih lama dari petunjuk kemasan), masukkan ${lc(p)}.`, "Potong pendek makaroni untuk usia di bawah 12 bulan."],
    minutes: 30,
    freezable: false,
  },
  {
    family: "bumbu-kuning",
    name: (p, v) => `${ING[p].short} Bumbu Kuning ${ING[v].short}`,
    proteins: ["ayam", "ayampaha", "kembung", "nila", "dori", "telur", "tahu", "tempe"],
    vegs: ["labusiam", "wortel", "buncis", "kacangpanjang", "labukuning", "zucchini"],
    stages: [2, 3],
    img: (s) => pick(s, ["pgulai", "x_coconutcurry"]),
    carb: carbRotate,
    extras: () => [ing("kunyit", 0.5, "sdt"), ing("bawang", 1, "siung"), ing("santan", 2, "sdm"), ing("kaldu", 80, "ml")],
    steps: (p, v, c) => [PROTEIN_PREP[p], "Tumis bawang dan kunyit dengan sedikit minyak hingga harum.", `Masukkan ${lc(p)}, ${lc(v)}, kaldu, dan santan; masak api kecil sambil diaduk hingga empuk.`, `Sajikan dengan ${lc(c)}, cincang sesuai tahap tekstur.`],
    minutes: 35,
    freezable: true,
  },
  {
    family: "opor",
    name: (p, v) => `Opor ${ING[p].short} ${ING[v].short}`,
    proteins: ["ayam", "ayampaha", "telur", "tahu", "hatiayam"],
    vegs: ["labusiam", "wortel", "buncis", "kacangpanjang", "labukuning"],
    stages: [2, 3],
    img: (s) => pick(s, ["popor", "pgulai"]),
    carb: carbRotate,
    extras: () => [ing("bawang", 1, "siung"), ing("santan", 50, "ml"), ing("kaldu", 80, "ml")],
    steps: (p, v, c) => [PROTEIN_PREP[p], "Tumis bawang dengan sedikit minyak, tambahkan sedikit ketumbar bubuk bila ada.", `Masukkan ${lc(p)}, ${lc(v)}, kaldu, dan santan, aduk terus sampai mendidih dan sayur empuk.`, `Sajikan dengan ${lc(c)}.`],
    minutes: 35,
    freezable: true,
  },
  {
    family: "pepes",
    name: (p, v) => `Pepes ${ING[p].short} ${ING[v].short}`,
    proteins: ["kembung", "nila", "dori", "ayam", "tahu", "teri"],
    vegs: ["tomat", "bayam", "jamur", "wortel", "labusiam"],
    stages: [2, 3],
    img: (s, p) => (["kembung", "nila", "dori", "teri"].includes(p) ? "ppepes" : pick(s, ["ppepes", "d_tofu"])),
    carb: () => "nasi",
    extras: () => [ing("bawang", 1, "siung"), ing("kunyit", 0.5, "sdt"), ing("minyak", 1, "sdt")],
    steps: (p, v) => [`Cincang halus ${lc(p)} mentah (bebas duri) dan ${lc(v)}.`, "Campur dengan bawang dan kunyit yang dihaluskan serta sedikit minyak.", "Bungkus daun pisang, kukus 25–30 menit hingga matang sempurna.", "Sajikan dengan nasi lembek."],
    minutes: 40,
    freezable: true,
  },
  {
    family: "bola-bola",
    name: (p, v) => `Bola-bola ${ING[p].short} ${ING[v].short} Kukus`,
    proteins: ["ayam", "sapi", "dori", "udang", "salmon"],
    vegs: ["wortel", "bayam", "brokoli", "jagung", "buncis", "labukuning"],
    stages: [2, 3],
    img: () => "pbakso",
    carb: carbRotate,
    extras: () => [ing("bawang", 1, "siung"), ing("kaldu", 60, "ml")],
    steps: (p, v, c) => [`Campur ${lc(p)} giling/cincang halus dengan ${lc(v)} cincang dan bawang.`, "Bentuk bola kecil seukuran kelereng.", "Kukus 15–20 menit hingga matang sempurna.", `Sajikan dengan ${lc(c)} dan sedikit kuah kaldu; belah kecil untuk usia di bawah 12 bulan.`],
    minutes: 35,
    freezable: true,
  },
  {
    family: "semur",
    name: (p, v) => `Semur Rempah ${ING[p].short} ${ING[v].short}`,
    proteins: ["sapi", "ayam", "ayampaha", "hatiayam", "hatisapi", "telur", "tahu"],
    vegs: ["wortel", "buncis", "tomat", "labusiam"],
    stages: [2, 3],
    img: () => "psemur",
    carb: (s) => pick(s, ["kentang", "nasi", "kentang"]),
    extras: () => [ing("bawang", 1, "siung"), ing("kaldu", 120, "ml"), ing("minyak", 1, "sdt")],
    steps: (p, v, c) => [PROTEIN_PREP[p], "Tumis bawang dengan sedikit pala dan kayu manis hingga harum (tanpa kecap untuk di bawah 12 bulan).", `Masukkan ${lc(p)}, ${lc(v)}, ${lc(c)}, dan kaldu; masak api kecil hingga sangat empuk.`, "Cincang atau potong kecil sesuai usia."],
    minutes: 45,
    freezable: true,
  },
  {
    family: "tumis",
    name: (p, v) => `Tumis Lembut ${ING[p].short} ${ING[v].short}`,
    proteins: ["ayam", "udang", "hatiayam", "sapi", "tahu", "tempe"],
    vegs: ["buncis", "brokoli", "sawi", "kembangkol", "zucchini", "jamur", "wortel", "labusiam"],
    stages: [2, 3],
    img: (s, p) => (p === "udang" ? "d_shrimp" : p === "tahu" ? "ptahu" : p === "tempe" ? "ptempe" : "d_vegsteam"),
    carb: () => "nasi",
    extras: () => [ing("bawang", 1, "siung"), ing("minyak", 1, "sdt"), ing("kaldu", 50, "ml")],
    steps: (p, v) => [PROTEIN_PREP[p], "Tumis bawang dengan minyak hingga harum.", `Masukkan ${lc(p)} dan ${lc(v)}, tambahkan sedikit kaldu, masak hingga sayur sangat empuk.`, "Sajikan dengan nasi lembek, cincang sesuai tahap."],
    minutes: 20,
    freezable: false,
  },
  {
    family: "orak-arik",
    name: (_p, v) => `Nasi Orak-arik Telur ${ING[v].short}`,
    proteins: ["telur"],
    vegs: ["wortel", "bayam", "brokoli", "tomat", "jagung", "buncis", "jamur", "zucchini", "sawi"],
    stages: [2, 3],
    img: (s) => pick(s, ["pdadar", "d_omelette"]),
    carb: () => "nasi",
    extras: (s) => [ing(pick(s, ["mentega", "minyak"]), 1, "sdt")],
    steps: (_p, v) => [`Cincang halus ${lc(v)}, kukus atau tumis sebentar hingga empuk.`, "Kocok telur, masak dengan api kecil sambil diaduk hingga matang penuh.", "Campur dengan sayur, sajikan dengan nasi lembek."],
    minutes: 15,
    freezable: false,
  },
  // tahap 3 saja
  {
    family: "nasi-goreng",
    name: (p, v) => `Nasi Goreng Mentega ${ING[p].short} ${ING[v].short}`,
    proteins: ["ayam", "udang", "telur", "sapi", "teri"],
    vegs: ["wortel", "buncis", "jagung", "brokoli", "kacangpanjang"],
    stages: [3],
    img: () => "pnasigoreng",
    carb: () => "nasi",
    extras: () => [ing("mentega", 1, "sdt"), ing("bawang", 1, "siung")],
    steps: (p, v) => [PROTEIN_PREP[p], "Lelehkan mentega, tumis bawang hingga harum.", `Masukkan ${lc(p)} dan ${lc(v)} cincang, lalu nasi; aduk rata dengan api kecil.`, "Tanpa garam tambahan; sajikan hangat."],
    minutes: 20,
    freezable: false,
  },
  {
    family: "mie-kuah",
    name: (p, v) => `Mie Kuah ${ING[p].short} ${ING[v].short}`,
    proteins: ["ayam", "sapi", "udang", "dori", "telur"],
    vegs: ["sawi", "wortel", "brokoli", "jamur", "bayam"],
    stages: [3],
    img: (s) => pick(s, ["d_noodle", "pmie"]),
    carb: () => "mie",
    extras: () => [ing("kaldu", 150, "ml"), ing("bawang", 1, "siung")],
    steps: (p, v) => [PROTEIN_PREP[p], "Rebus mie hingga lebih empuk dari biasa, potong pendek.", `Didihkan kaldu dengan bawang, masukkan ${lc(v)} dan ${lc(p)}.`, "Tuang ke atas mie, sajikan hangat."],
    minutes: 25,
    freezable: false,
  },
  {
    family: "schotel",
    name: (p, v) => `Makaroni Schotel ${ING[p].short} ${ING[v].short}`,
    proteins: ["ayam", "sapi", "dori", "salmon"],
    vegs: ["brokoli", "wortel", "jagung", "bayam", "kembangkol"],
    stages: [3],
    img: () => "pmakaroni",
    carb: () => "makaroni",
    extras: () => [ing("telur", 1, "butir"), ing("keju", 10), ing("mentega", 1, "sdt")],
    steps: (p, v) => [PROTEIN_PREP[p], "Rebus makaroni hingga empuk.", `Campur makaroni, ${lc(p)}, ${lc(v)} cincang, telur kocok, dan keju.`, "Masukkan cetakan bermentega, kukus 25 menit atau panggang 20 menit hingga set."],
    minutes: 45,
    freezable: true,
  },
  {
    family: "soto",
    name: (p, v) => `Soto ${ING[p].short} Bening ${ING[v].short}`,
    proteins: ["ayam", "ayampaha", "sapi", "telur"],
    vegs: ["wortel", "bayam", "sawi", "kembangkol", "tomat"],
    stages: [3],
    img: () => "psoto",
    carb: () => "nasi",
    extras: () => [ing("kunyit", 0.5, "sdt"), ing("bawang", 1, "siung"), ing("kaldu", 150, "ml")],
    steps: (p, v) => [PROTEIN_PREP[p], "Tumis bawang dan kunyit, masukkan ke kaldu yang mendidih.", `Masukkan ${lc(p)} dan ${lc(v)}, masak hingga empuk.`, "Sajikan dengan nasi, potong kecil."],
    minutes: 35,
    freezable: true,
  },
  {
    family: "semur-kecap",
    name: (p, v) => `Semur ${ING[p].short} Kecap ${ING[v].short}`,
    proteins: ["sapi", "ayam", "telur", "tahu", "tempe"],
    vegs: ["wortel", "buncis", "tomat"],
    stages: [3],
    img: () => "psemur",
    carb: () => "kentang",
    extras: () => [ing("kecap", 0.5, "sdt"), ing("bawang", 1, "siung"), ing("kaldu", 100, "ml")],
    steps: (p, v) => [PROTEIN_PREP[p], "Tumis bawang dengan pala & kayu manis.", `Masukkan ${lc(p)}, ${lc(v)}, kentang, kaldu, dan kecap sedikit saja (usia 12 bulan ke atas).`, "Masak api kecil hingga empuk dan kuah menyusut."],
    minutes: 45,
    freezable: true,
  },
];

for (const m of METHODS)
  for (const p of m.proteins)
    for (const v of m.vegs) {
      const seed = m.family + p + v;
      const c = m.carb(seed);
      const items: Ingredient[] = [];
      if (c === "beras") items.push(ing("beras", 25));
      else if (c === "nasi") items.push(ing("nasi", 60));
      else items.push(ing(c, c === "makaroni" || c === "mie" ? 25 : c === "berasmerah" ? 25 : 40));
      items.push(p === "telur" ? ing("telur", 1, "butir") : ing(p, 25));
      items.push(ing(v, 20));
      items.push(...m.extras(seed).filter((x) => !(p === "telur" && x.key === "telur")));
      add(
        build({
          name: m.name(p, v),
          family: m.family,
          slot: "utama",
          stages: m.stages,
          img: m.img(seed, p, v),
          minutes: m.minutes,
          freezable: m.freezable && p !== "telur",
          items,
          steps: m.steps(p, v, c),
        }),
      );
    }

// ───────────── Snack ─────────────
const FRUITS = ["pisang", "alpukat", "pepaya", "mangga", "melon", "pir", "apel", "naga"];
const fruitPhoto = (f: string) => (f === "alpukat" ? "d_avocado" : f === "pisang" ? "pfruitpuree" : ING[f].photo);
for (const f of FRUITS)
  add(build({ name: `Pure ${ING[f].short}`, family: "pure-buah", slot: "snack", stages: [1], img: fruitPhoto(f), minutes: f === "pir" || f === "apel" ? 15 : 5, freezable: false, items: [ing(f, 40)], steps: [f === "pir" || f === "apel" ? `Kupas ${lc(f)}, kukus hingga sangat lunak.` : `Kerok daging ${lc(f)} dengan sendok.`, "Lumatkan hingga halus; encerkan dengan ASI bila terlalu kental."] }));
for (let a = 0; a < FRUITS.length; a++)
  for (let b = a + 1; b < FRUITS.length; b++) {
    const [x, y] = [FRUITS[a], FRUITS[b]];
    add(build({ name: `Pure ${ING[x].short} ${ING[y].short}`, family: "pure-buah", slot: "snack", stages: [1, 2], img: pick(x + y, ["d_fruitbowl", fruitPhoto(x), fruitPhoto(y)]), minutes: 10, freezable: false, items: [ing(x, 25), ing(y, 25)], steps: [`Siapkan ${lc(x)} dan ${lc(y)} matang (kukus dulu bila keras).`, "Lumatkan bersama hingga halus atau sesuai tekstur usia."] }));
  }
for (const f of FRUITS)
  for (const c of ["ubi", "kentang", "labukuning", "ubiungu"])
    add(build({ name: `Pure ${ING[f].short} ${ING[c].short}`, family: "pure-buah", slot: "snack", stages: [1, 2], img: pick(f + c, [fruitPhoto(f), "x_pumpkinsoup", "d_fruitbowl"]), minutes: 20, freezable: false, items: [ing(f, 25), ing(c, 25)], steps: [`Kukus ${lc(c)} hingga sangat empuk.`, `Lumatkan bersama ${lc(f)} matang hingga halus atau sesuai tekstur usia.`], extraTags: ["padat-energi"] }));
for (const f of FRUITS)
  add(build({ name: `Yogurt ${ING[f].short}`, family: "yogurt", slot: "snack", stages: [1, 2, 3], img: "d_yogurt", minutes: 5, freezable: false, items: [ing("yogurt", 40), ing(f, 20)], steps: [`Lumatkan ${lc(f)}.`, "Campur dengan yogurt plain tanpa gula, sajikan dingin."] }));
for (const c of ["ubi", "ubiungu", "kentang", "labukuning"])
  for (const fat of ["mentega", "keju", "santan"]) {
    if (c === "labukuning" && fat === "santan") continue;
    add(build({ name: `Pure ${ING[c].short} ${ING[fat].short}`, family: "pure-umbi", slot: "snack", stages: [1, 2], img: c === "ubiungu" ? "x_beetsoup" : c === "kentang" ? "x_mashed" : "x_pumpkinsoup", minutes: 20, freezable: true, items: [ing(c, 40), ing(fat, fat === "keju" ? 5 : 1, fat === "keju" ? "g" : "sdt")], steps: [`Kukus ${lc(c)} hingga sangat empuk.`, `Lumatkan selagi hangat bersama ${lc(fat)}.`], extraTags: ["padat-energi"] }));
  }
for (const f of ["pisang", "apel", "labukuning", "ubi", "pir"])
  for (const base of ["terigu", "oat"])
    add(build({ name: `Pancake ${base === "oat" ? "Oat " : ""}${ING[f].short}`, family: "pancake", slot: "snack", stages: [2, 3], img: "d_pancake", minutes: 15, freezable: true, items: [ing(f, 40), ing("telur", 1, "butir"), ing(base, 1, "sdm"), ing("mentega", 1, "sdt")], steps: [`Lumatkan ${lc(f)} (kukus dulu bila keras).`, `Campur dengan telur dan ${lc(base)}.`, "Tuang sesendok ke teflon bermentega, masak api kecil hingga matang di kedua sisi.", "Potong memanjang sebagai finger food."], extraTags: ["finger-food", "padat-energi"] }));
for (const p of ["ayam", "dori", "sapi", "salmon", "tempe"])
  for (const v of ["wortel", "brokoli", "bayam", "jagung"])
    add(build({ name: `Nugget ${ING[p].short} ${ING[v].short} Kukus`, family: "nugget", slot: "snack", stages: [2, 3], img: pick(p + v, ["pnugget", "d_nugget"]), minutes: 30, freezable: true, items: [ing(p, 30), ing(v, 15), ing("bawang", 0.5, "siung"), ing("terigu", 1, "sdt")], steps: [`Cincang halus ${lc(p)} dan ${lc(v)}, campur bawang dan sedikit tepung.`, "Bentuk lonjong kecil, kukus 20 menit hingga matang.", "Bisa dipanggang sebentar dengan sedikit minyak agar permukaan kering (bukan keras)."], extraTags: ["finger-food"] }));
for (const c of ["kentang", "ubi"])
  for (const p of ["ayam", "dori", "tahu", "teri", "sapi", "telur"])
    add(build({ name: `Perkedel ${ING[c].short} ${ING[p].short} Kukus`, family: "perkedel", slot: "snack", stages: [2, 3], img: "pperkedel", minutes: 30, freezable: true, items: [ing(c, 40), p === "telur" ? ing("telur", 1, "butir") : ing(p, 20), ing("bawang", 0.5, "siung")], steps: [`Kukus ${lc(c)} lalu lumatkan.`, PROTEIN_PREP[p], "Campur semua, bentuk bulat pipih, kukus 10 menit atau panggang dengan sedikit minyak."], extraTags: ["finger-food"] }));
for (const v of ["wortel", "brokoli", "buncis", "zucchini", "labukuning", "kembangkol"])
  add(build({ name: `Stik ${ING[v].short} Kukus`, family: "stik-sayur", slot: "snack", stages: [2, 3], img: v === "brokoli" ? "pfinger" : "d_vegsteam", minutes: 15, freezable: false, items: [ing(v, 50), ing("minyak", 1, "sdt")], steps: [`Potong ${lc(v)} memanjang seukuran jari orang dewasa (brokoli per kuntum dengan batangnya).`, "Kukus hingga bisa dilumat dengan tekanan jari.", "Olesi sedikit minyak, sajikan hangat."], extraTags: ["finger-food"] }));
for (const c of ["kentang", "ubi", "ubiungu"])
  add(build({ name: `Wedges ${ING[c].short} Panggang`, family: "wedges", slot: "snack", stages: [2, 3], img: "d_wedges", minutes: 30, freezable: false, items: [ing(c, 50), ing("minyak", 1, "sdt")], steps: [`Potong ${lc(c)} memanjang, kukus 10 menit.`, "Olesi minyak, panggang hingga empuk (bukan renyah keras)."], extraTags: ["finger-food"] }));
for (const f of FRUITS.filter((x) => x !== "alpukat"))
  add(build({ name: `Buah Potong ${ING[f].short}`, family: "buah-potong", slot: "snack", stages: [2, 3], img: ING[f].photo, minutes: 5, freezable: false, items: [ing(f, 50)], steps: ["Potong memanjang seukuran jari untuk 9–11 bulan, dadu kecil untuk 12 bulan ke atas.", "Pastikan lunak; apel & pir dikukus dulu."], extraTags: ["finger-food"] }));
for (const f of ["mangga", "pisang", "pepaya", "naga", "labukuning"])
  add(build({ name: `Puding Santan ${ING[f].short}`, family: "puding", slot: "snack", stages: [2, 3], img: "d_pudding", minutes: 20, freezable: false, items: [ing("santan", 60, "ml"), ing(f, 30)], steps: ["Larutkan 1 sdt agar-agar tawar dalam santan, masak sambil diaduk hingga mendidih.", `Masukkan ${lc(f)} lumat, aduk, tuang ke cetakan.`, "Dinginkan hingga set. Tanpa gula untuk di bawah 12 bulan."] }));
for (const f of ["pisang", "apel", "labukuning", "wortel"])
  add(build({ name: `Muffin Kukus ${ING[f].short}`, family: "muffin", slot: "snack", stages: [3], img: "d_muffin", minutes: 30, freezable: true, items: [ing("terigu", 2, "sdm"), ing("telur", 1, "butir"), ing(f, 40), ing("mentega", 1, "sdt")], steps: [`Lumatkan ${lc(f)}, campur telur, mentega leleh, dan tepung.`, "Tuang ke cetakan kecil, kukus 20 menit hingga matang."], extraTags: ["finger-food"] }));
for (const s of ["alpukat", "pisang", "keju", "telur"])
  add(build({ name: `Roti ${ING[s].short}`, family: "roti", slot: "snack", stages: [3], img: "d_toast", minutes: 10, freezable: false, items: [ing("roti", 1, "lembar"), s === "telur" ? ing("telur", 1, "butir") : ing(s, s === "keju" ? 10 : 30)], steps: ["Panggang roti sebentar, buang pinggirannya.", s === "telur" ? "Oles dengan telur orak-arik matang." : `Oles ${lc(s)} lumat/parut.`, "Potong memanjang."], extraTags: ["finger-food"] }));
for (const p of ["ayam", "salmon", "telur", "teri", "sapi"])
  for (const v of ["wortel", "bayam", "jagung"])
    add(build({ name: `Bola Nasi ${ING[p].short} ${ING[v].short}`, family: "bola-nasi", slot: "snack", stages: [2, 3], img: "d_ricebowl", minutes: 20, freezable: false, items: [ing("nasi", 50), p === "telur" ? ing("telur", 1, "butir") : ing(p, 20), ing(v, 10)], steps: [PROTEIN_PREP[p], `Campur nasi hangat dengan ${lc(p)} dan ${lc(v)} cincang.`, "Kepal kecil seukuran genggaman bayi."], extraTags: ["finger-food"] }));
for (const v of ["bayam", "wortel", "brokoli", "jagung", "tomat", "jamur"])
  add(build({ name: `Omelet Mini ${ING[v].short}`, family: "omelet", slot: "snack", stages: [2, 3], img: pick(v, ["pdadar", "d_omelette"]), minutes: 10, freezable: false, items: [ing("telur", 1, "butir"), ing(v, 15), ing("minyak", 1, "sdt")], steps: [`Kocok telur dengan ${lc(v)} cincang.`, "Masak api kecil hingga matang penuh, potong stik."], extraTags: ["finger-food"] }));
// Bubur sumsum & bubur kacang hijau versi bayi
for (const f of ["labukuning", "pisang", "ubi"])
  add(build({ name: `Bubur Sumsum ${ING[f].short}`, family: "sumsum", slot: "snack", stages: [1, 2, 3], img: "psumsum", minutes: 20, freezable: false, items: [ing("beras", 10), ing("santan", 60, "ml"), ing(f, 20)], steps: ["Larutkan tepung beras (atau beras yang dihaluskan) dalam santan.", "Masak sambil terus diaduk hingga mengental.", `Campur ${lc(f)} lumat. Tanpa gula untuk di bawah 12 bulan.`], extraTags: ["padat-energi"] }));

export const RECIPES: Recipe[] = R;
export const RECIPE_MAP: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

export function scaleQty(qty: number, stage: 1 | 2 | 3) {
  const f = stage === 1 ? 1 : stage === 2 ? 1.3 : 1.6;
  const v = qty * f;
  return v >= 10 ? Math.round(v / 5) * 5 : Math.round(v * 2) / 2;
}

export function ingredientPhoto(i: Ingredient) {
  return (i.key && ING[i.key]?.photo) || "d_babyfood";
}

export const TEXTURE_NOTE: Record<1 | 2 | 3, string> = {
  1: "Saring atau blender hingga kental (tidak encer), lalu bertahap menjadi lumat kasar. Tahan di sendok saat dimiringkan.",
  2: "Cincang halus hingga kasar. Mulai beri finger food lunak yang bisa dilumat dengan jari.",
  3: "Makanan keluarga yang dipotong kecil (±1 cm) dan lunak dikunyah.",
};

export const FAMILY_LABEL: Record<string, string> = {
  bubur: "Bubur",
  "nasi-tim": "Nasi tim",
  sup: "Sup",
  "sup-makaroni": "Sup makaroni",
  "bumbu-kuning": "Bumbu kuning",
  opor: "Opor",
  pepes: "Pepes kukus",
  "bola-bola": "Bola-bola",
  semur: "Semur rempah",
  tumis: "Tumisan",
  "orak-arik": "Orak-arik",
  "nasi-goreng": "Nasi goreng",
  "mie-kuah": "Mie kuah",
  schotel: "Schotel",
  soto: "Soto",
  "semur-kecap": "Semur",
  "pure-buah": "Pure buah",
  yogurt: "Yogurt",
  "pure-umbi": "Pure umbi",
  pancake: "Pancake",
  nugget: "Nugget",
  perkedel: "Perkedel",
  "stik-sayur": "Finger food",
  wedges: "Finger food",
  "buah-potong": "Buah potong",
  puding: "Puding",
  muffin: "Muffin",
  roti: "Roti",
  "bola-nasi": "Bola nasi",
  omelet: "Omelet",
  sumsum: "Bubur sumsum",
};
