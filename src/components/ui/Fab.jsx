import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

// Floating action button — present on every view to add a tracker.
export default function Fab({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      aria-label="Add a tracker"
      className="fixed z-40 right-5 bottom-24 md:bottom-8 w-14 h-14 rounded-full grid place-items-center text-white shadow-lg"
      style={{ background: "#534AB7", boxShadow: "0 8px 24px rgba(83,74,183,0.4)" }}
    >
      <Plus size={26} />
    </motion.button>
  );
}
