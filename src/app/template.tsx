"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { IOS_EASE } from "@/components/motion";
import { takeNav } from "@/components/navdir";

export default function Template({ children }: { children: React.ReactNode }) {
  const [dir] = useState(takeNav);
  return (
    <motion.div
      initial={{ x: dir === "push" ? "30%" : "-24%", opacity: dir === "push" ? 0.3 : 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: IOS_EASE }}
      className="min-h-dvh"
    >
      {children}
    </motion.div>
  );
}
