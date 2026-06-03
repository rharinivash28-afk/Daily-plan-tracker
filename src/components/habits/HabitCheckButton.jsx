import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

// 40px spring-animated check button.
export default function HabitCheckButton({ done, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 1.3 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
      aria-label={done ? "Mark incomplete" : "Mark complete"}
      className="w-10 h-10 rounded-full grid place-items-center border-2 shrink-0 transition-colors"
      style={
        done
          ? { background: "var(--accent)", borderColor: "var(--accent)" }
          : { background: "transparent", borderColor: "rgba(0,0,0,0.18)" }
      }
    >
      <motion.span
        initial={false}
        animate={{ scale: done ? 1 : 0.6, opacity: done ? 1 : 0.35 }}
        transition={{ duration: 0.2 }}
      >
        <Check size={20} strokeWidth={3} className={done ? "text-white" : "text-ink-hint"} />
      </motion.span>
    </motion.button>
  );
}
