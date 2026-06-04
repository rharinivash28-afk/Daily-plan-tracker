import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../ui/Button.jsx";
import { randomQuote } from "../../utils/quotes.js";

export default function DayCompleteModal({ open, count, streak, onClose }) {
  const quote = useMemo(() => randomQuote(), [open]);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!open) return;
    setProgress(100);
    const start = Date.now();
    const dur = 5000;
    const iv = setInterval(() => {
      const pct = Math.max(0, 100 - ((Date.now() - start) / dur) * 100);
      setProgress(pct);
      if (pct <= 0) { clearInterval(iv); onClose(); }
    }, 50);
    return () => clearInterval(iv);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        // Full-height wrapper (not position:fixed) per spec.
        <motion.div
          className="absolute inset-0 z-40 grid place-items-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-purple-600/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-sm bg-card-light dark:bg-card-dark rounded-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden text-center p-7"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="w-20 h-20 mx-auto mb-4">
              <svg viewBox="0 0 52 52" className="w-full h-full">
                <motion.circle cx="26" cy="26" r="24" fill="none" stroke="var(--accent)" strokeWidth="3"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                <motion.path d="M16 27 l7 7 l14 -16" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-ink dark:text-ink-dark">Day Complete! 🎉</h2>
            <p className="mt-1.5 text-sm text-ink-muted">
              You completed all {count} habit{count === 1 ? "" : "s"} today. Streak: {streak} day{streak === 1 ? "" : "s"} 🔥
            </p>
            <p className="mt-4 text-sm italic text-purple-600 dark:text-purple-200">"{quote}"</p>
            <Button className="w-full mt-6" onClick={onClose}>Close</Button>

            <div className="absolute bottom-0 left-0 h-1 bg-purple-600" style={{ width: `${progress}%`, transition: "width 0.05s linear" }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
