import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToastState } from "../../hooks/useToast.jsx";

const CONFIG = {
  success: { icon: CheckCircle2, color: "#1D9E75" },
  error: { icon: XCircle, color: "#D85A30" },
  info: { icon: Info, color: "#534AB7" },
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToastState();
  return (
    <div className="fixed z-[60] bottom-20 md:bottom-5 right-4 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const { icon: Icon, color } = CONFIG[t.type] || CONFIG.info;
          return (
            <motion.div
              key={t.id}
              initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="pointer-events-auto flex items-center gap-2.5 pl-3 pr-2 py-2.5 rounded-xl bg-card-light dark:bg-card-dark border border-black/[0.08] dark:border-white/[0.08] min-w-[220px] max-w-xs"
              style={{ borderLeft: `3px solid ${color}` }}
            >
              <Icon size={18} style={{ color }} className="shrink-0" />
              <span className="flex-1 text-sm text-ink dark:text-ink-dark">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="p-1 rounded-md text-ink-hint hover:bg-black/5 dark:hover:bg-white/10"><X size={14} /></button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
