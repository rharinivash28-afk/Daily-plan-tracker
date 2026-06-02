import React from "react";
import { motion } from "framer-motion";
import { EMOJI_OPTIONS } from "../../utils/habitDefaults.js";

export default function EmojiPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {EMOJI_OPTIONS.map((e) => {
        const active = value === e;
        return (
          <motion.button
            key={e}
            type="button"
            onClick={() => onChange(e)}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: active ? 1.2 : 1 }}
            className={`aspect-square grid place-items-center text-lg rounded-lg transition-colors ${
              active
                ? "border-2 border-purple-600 bg-purple-50 dark:bg-purple-900/40"
                : "border border-transparent hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {e}
          </motion.button>
        );
      })}
    </div>
  );
}
