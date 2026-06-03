import React from "react";
import { motion } from "framer-motion";

const variants = {
  primary: "bg-accent text-white",
  outline: "border border-accent text-accent hover-accent-soft",
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
