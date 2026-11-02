"use client";
import { AnimatePresence, motion, useDragControls, type HTMLMotionProps } from "motion/react";
import { useEffect, type ReactNode } from "react";

export const IOS_EASE = [0.32, 0.72, 0, 1] as const;
export const spring = { type: "spring", stiffness: 420, damping: 36, mass: 0.9 } as const;

/** Tombol dengan efek tekan (scale) ala iOS. */
export function Tap({ children, className = "", ...rest }: HTMLMotionProps<"button">) {
  return (
    <motion.button whileTap={{ scale: 0.96 }} transition={{ duration: 0.12 }} className={className} {...rest}>
      {children}
    </motion.button>
  );
}

/** Daftar yang muncul berurutan (stagger). */
export function Stagger({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: delay } } }}>
      {children}
    </motion.div>
  );
}
export function Item({ children, className = "", ...rest }: HTMLMotionProps<"div">) {
  return (
    <motion.div className={className} variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: IOS_EASE } } }} {...rest}>
      {children}
    </motion.div>
  );
}

/** Bottom sheet dengan drag-to-dismiss. */
export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  const controls = useDragControls();
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 mx-auto max-w-[440px]">
          <motion.div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[32px] bg-white pb-[max(env(safe-area-inset-bottom),16px)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={spring}
            drag="y"
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => (i.offset.y > 120 || i.velocity.y > 600) && onClose()}
          >
            <div className="sticky top-0 z-10 bg-white/95 pb-2 pt-3 backdrop-blur" onPointerDown={(e) => controls.start(e)} style={{ touchAction: "none" }}>
              <div className="mx-auto h-1.5 w-12 rounded-full bg-line" />
              {title && <p className="mt-3 px-6 text-lg font-semibold">{title}</p>}
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
