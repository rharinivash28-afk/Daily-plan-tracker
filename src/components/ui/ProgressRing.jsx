import React from "react";
import { motion } from "framer-motion";

// Animated SVG progress ring. pct = 0..100.
export default function ProgressRing({ pct = 0, size = 132, stroke = 12, label = "today" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(100, Math.max(0, pct)) / 100);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="currentColor" strokeWidth={stroke}
          className="text-purple-100 dark:text-purple-900"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#534AB7" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-ink dark:text-ink-dark tabular-nums">{Math.round(pct)}%</span>
        <span className="text-xs text-ink-muted">{label}</span>
      </div>
    </div>
  );
}
