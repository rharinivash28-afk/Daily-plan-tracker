import React from "react";
import { motion } from "framer-motion";

const variants = {
  primary: "bg-purple-600 text-white hover:bg-purple-800",
  outline: "border border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30",
  ghost: "text-ink-muted hover:bg-black/5 dark:text-ink-dark dark:hover:bg-white/10",
  danger: "bg-[#D85A30] text-white hover:opacity-90",
};

const sizes = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-5 py-3",
};

export default function Button({
  variant = "primary", size = "md", className = "", children, as, ...props
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`;
  return (
    <motion.button whileTap={{ scale: 0.97 }} className={cls} {...props}>
      {children}
    </motion.button>
  );
}
