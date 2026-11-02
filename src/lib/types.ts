export type Allergen = "telur" | "susu" | "kacang" | "ikan" | "seafood" | "gandum" | "kedelai";
export type Protein = "ayam" | "hati" | "ikan" | "telur" | "sapi" | "udang";
export type Stage = 1 | 2 | 3; // 1: 6–8 bln, 2: 9–11 bln, 3: 12–23 bln
export type Slot = "utama" | "snack";
export type Tool = "blender" | "slowcooker" | "kukusan" | "freezer";
export type Concern = "bb" | "gtm" | "alergi" | "bingung" | "waktu";
export type Budget = "hemat" | "sedang" | "longgar";
export type CookMode = "harian" | "mealprep";
export type Texture = "pure" | "lumat" | "cincang" | "finger" | "keluarga";
export type Started = "belum" | "baru" | "lanjut";
export type PackageId = "dasar" | "lengkap" | "tigabulan";

export interface Ingredient {
  item: string;
  qty: number;
  unit: "g" | "ml" | "sdm" | "sdt" | "butir" | "buah" | "lembar" | "batang" | "siung";
  group: "karbo" | "protein" | "sayur" | "buah" | "lemak" | "bumbu" | "lain";
}

export interface Recipe {
  id: string;
  name: string;
  slot: Slot;
  stages: Stage[];
  ingredients: Ingredient[];
  steps: string[];
  allergens: Allergen[];
  protein: Protein | null; // protein hewani utama
  tags: ("zat-besi" | "lemak-tambahan" | "padat-energi" | "finger-food" | "sayur-hijau")[];
  cost: 1 | 2 | 3;
  minutes: number;
  freezable: boolean;
  emoji: string;
}

export interface QuizAnswers {
  name: string;
  dob: string; // YYYY-MM-DD
  started: Started;
  texture: Texture;
  allergies: Allergen[];
  concern: Concern;
  proteins: Protein[];
  budget: Budget;
  cookMode: CookMode;
  tools: Tool[];
}

export interface Meal {
  slot: Slot;
  label: string; // Pagi, Snack pagi, Siang, ...
  recipeId: string;
  newAllergen?: Allergen | null;
}

export interface PlanDay {
  day: number; // 1..30
  date: string; // YYYY-MM-DD
  ageMonths: number;
  stage: Stage;
  meals: Meal[];
  prepDay?: boolean; // hari masak meal prep
  textureUp?: boolean; // hari naik tahap tekstur
}

export interface Plan {
  month: number; // 1..3
  startDate: string;
  days: PlanDay[];
  seed: string;
}
