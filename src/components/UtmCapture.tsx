"use client";
import { useEffect } from "react";
import { store } from "@/lib/client";

export default function UtmCapture() {
  useEffect(() => store.captureUtm(), []);
  return null;
}
