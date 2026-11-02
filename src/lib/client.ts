"use client";
import type { QuizAnswers } from "./types";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function track(event: string, params?: Record<string, unknown>, eventID?: string) {
  try {
    const standard = ["PageView", "Lead", "InitiateCheckout", "AddPaymentInfo", "Purchase", "ViewContent", "CompleteRegistration"];
    window.fbq?.(standard.includes(event) ? "track" : "trackCustom", event, params ?? {}, eventID ? { eventID } : undefined);
  } catch {}
}

export function cookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

const KEY = "mpasi_answers";
const safe = <T,>(fn: () => T, fallback: T) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const store = {
  getAnswers: (): Partial<QuizAnswers> | null => safe(() => JSON.parse(sessionStorage.getItem(KEY) || localStorage.getItem(KEY) || "null"), null),
  setAnswers: (a: Partial<QuizAnswers>) =>
    safe(() => {
      const s = JSON.stringify(a);
      sessionStorage.setItem(KEY, s);
      localStorage.setItem(KEY, s);
    }, undefined),
  getUtm: (): Record<string, string> => safe(() => JSON.parse(sessionStorage.getItem("mpasi_utm") || "{}"), {}),
  captureUtm: () =>
    safe(() => {
      const p = new URLSearchParams(location.search);
      const utm: Record<string, string> = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"].forEach((k) => {
        const v = p.get(k);
        if (v) utm[k] = v;
      });
      if (Object.keys(utm).length) sessionStorage.setItem("mpasi_utm", JSON.stringify(utm));
      if (utm.fbclid && !cookie("_fbc")) document.cookie = `_fbc=fb.1.${Date.now()}.${utm.fbclid}; path=/; max-age=7776000`;
    }, undefined),
  setToken: (t: string) => safe(() => localStorage.setItem("mpasi_token", t), undefined),
  getToken: () => safe(() => localStorage.getItem("mpasi_token"), null),
};
