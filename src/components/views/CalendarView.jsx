import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Maximize2, ArrowLeft } from "lucide-react";
import { getMonthGrid, MONTH_NAMES, DOW_LABELS, todayKey } from "../../utils/dates.js";
import { dayCompletion } from "../../utils/streakLogic.js";
import { heatmapColor, heatmapColorDark } from "../../utils/colors.js";
import { useTheme } from "../../hooks/useTheme.js";
import DayPlanPanel from "./DayPlanPanel.jsx";

export default function CalendarView({ habits, weekStartsOn, journal, onToggle, onSetTarget, onSetActual, onEdit, onDelete, onArchive, onAdd }) {
  const { isDark } = useTheme();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(null);
  const [full, setFull] = useState(false);

  const cells = useMemo(() => getMonthGrid(year, month, weekStartsOn), [year, month, weekStartsOn]);
  const tKey = todayKey();

  // Earliest day we have data for (account/first-habit start). Days before this
  // or in the future shouldn't show a "0/N" count — that implies missed days.
  const startKey = useMemo(() => {
    const dates = habits.map((h) => (h.createdAt || "").slice(0, 10)).filter(Boolean);
    return dates.length ? dates.sort()[0] : tKey;
  }, [habits, tKey]);

  const prev = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

  const labels = weekStartsOn === 0 ? ["S", ...DOW_LABELS.slice(0, 6)] : DOW_LABELS;

  const panelProps = {
    habits, weekStartsOn, journal, onToggle, onSetTarget, onSetActual, onEdit, onDelete, onArchive,
    onAdd: () => onAdd && onAdd(selected),
  };

  // Full-screen day view
  if (full && selected) {
    return (
      <div className="space-y-4">
        <button onClick={() => setFull(false)} className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:underline">
          <ArrowLeft size={16} /> Back to calendar
        </button>
        <DayPlanPanel dateKey={selected} {...panelProps} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink dark:text-ink-dark">{MONTH_NAMES[month]} {year}</h1>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="p-2 rounded-lg text-ink-muted hover:bg-black/5 dark:hover:bg-white/10"><ChevronLeft size={18} /></button>
          <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }} className="px-3 py-1.5 text-sm rounded-lg text-ink-muted hover:bg-black/5 dark:hover:bg-white/10">Today</button>
          <button onClick={next} className="p-2 rounded-lg text-ink-muted hover:bg-black/5 dark:hover:bg-white/10"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark">
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {labels.map((l, i) => <div key={i} className="text-center text-[11px] font-bold uppercase text-ink-hint">{l}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((cell) => {
            // Only days from account start through today are "active" — past days
            // before signup and future days don't show a count (would imply misses).
            const inRange = cell.key >= startKey && cell.key <= tKey;
            const { done, total } = inRange ? dayCompletion(habits, cell.date) : { done: 0, total: 0 };
            const ratio = total ? done / total : 0;
            const fill = inRange && total && done ? (isDark ? heatmapColorDark(ratio) : heatmapColor(ratio)) : null;
            const isToday = cell.key === tKey;
            const isSel = selected === cell.key;
            return (
              <button
                key={cell.key}
                onClick={() => setSelected(cell.key)}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all hover:scale-[1.05] ${cell.inMonth ? "" : "opacity-30"} ${isSel ? "ring-2 ring-purple-600" : isToday ? "ring-2 ring-purple-300" : ""}`}
                style={{ background: fill || "transparent", color: fill ? "#fff" : undefined }}
              >
                <span className={`font-semibold ${!fill ? "text-ink dark:text-ink-dark" : ""} ${isToday && !fill ? "text-purple-600" : ""}`}>{cell.date.getDate()}</span>
                {inRange && total > 0 && <span className={`text-[9px] ${fill ? "text-white/80" : "text-ink-hint"}`}>{done}/{total}</span>}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink-muted">Tap any date to see and edit that day's plan.</p>
      </div>

      {/* slide-in side panel */}
      <AnimatePresence>
        {selected && !full && (
          <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
            <motion.aside
              className="relative w-full max-w-md h-full bg-bg-light dark:bg-bg-dark overflow-y-auto"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur border-b border-black/[0.06] dark:border-white/[0.08]">
                <button onClick={() => setFull(true)} className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:underline" title="Open full screen">
                  <Maximize2 size={15} /> Full view
                </button>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-ink-muted hover:bg-black/5 dark:hover:bg-white/10"><X size={18} /></button>
              </div>
              <div className="p-5">
                <DayPlanPanel dateKey={selected} {...panelProps} />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
