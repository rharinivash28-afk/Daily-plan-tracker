import React from "react";
import { motion } from "framer-motion";
import { catColors } from "../../utils/colors.js";
import { useTheme } from "../../hooks/useTheme.js";

// Streak badge: pulses at >=7, soft glowing ring at >=30.
export default function StreakBadge({ streak, category }) {
  const { isDark } = useTheme();
  if (!streak || streak < 1) return null;
  const c = catColors(category, isDark);
  const pulse = streak >= 7;
  const glow = streak >= 30;

  return (
    <motion.span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.text }}
      animate={pulse ? { scale: [1, 1.05, 1] } : {}}
      transition={pulse ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
    >
      <motion.span
        animate={glow ? { textShadow: ["0 0 0px #FFB800", "0 0 8px #FFB800", "0 0 0px #FFB800"] } : {}}
        transition={glow ? { repeat: Infinity, duration: 2 } : {}}
      >
        🔥
      </motion.span>
      {streak} day{streak === 1 ? "" : "s"}
    </motion.span>
  );
}
