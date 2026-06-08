import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MoreVertical, Pencil, Trash2, Archive } from "lucide-react";
import HabitDots from "./HabitDots.jsx";
import HabitCheckButton from "./HabitCheckButton.jsx";
import TimeControl from "./TimeControl.jsx";
import StreakBadge from "../ui/StreakBadge.jsx";
import { catColors, catLabel } from "../../utils/colors.js";
import { isCompletedOn } from "../../utils/streakLogic.js";
import { useStreak } from "../../hooks/useStreak.js";
import { useTheme } from "../../hooks/useTheme.js";
import { fromKey } from "../../utils/dates.js";

export default function HabitCard({ habit, dateKey, onToggle, onSetTarget, onSetActual, onSetValue, onEdit, onDelete, onArchive, dimmed, weekStartsOn, compact }) {
  const { isDark } = useTheme();
  const c = catColors(habit.category, isDark);
  const { current: streak } = useStreak(habit);
  const done = isCompletedOn(habit, fromKey(dateKey));
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menu) return;
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: dimmed ? 0.4 : 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`group relative flex items-center gap-3 sm:gap-4 rounded-2xl border transition-colors ${compact ? "p-2.5 sm:p-3" : "p-3 sm:p-4"}`}
      style={{
        background: done ? "rgba(127,119,221,0.05)" : "var(--card)",
        borderColor: "rgba(0,0,0,0.08)",
      }}
    >
      {/* emoji pill */}
      <div className={`rounded-xl grid place-items-center shrink-0 ${compact ? "w-8 h-8 text-base" : "w-10 h-10 text-xl"}`} style={{ background: c.bg }}>
        {habit.emoji}
      </div>

      {/* middle */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate text-ink dark:text-ink-dark transition-all ${done ? "line-through opacity-60" : ""}`}>
            {habit.name}
          </span>
          {compact && (
            <span className="text-xs text-ink-muted shrink-0">· {catLabel(habit.category)}</span>
          )}
        </div>
        {!compact && (
          <div className="text-xs text-ink-muted mt-0.5 truncate">
            {catLabel(habit.category)}{habit.duration ? ` · ${habit.duration}` : ""}
          </div>
        )}
        <TimeControl
          habit={habit} dateKey={dateKey} done={done}
          onSetTarget={onSetTarget} onSetActual={onSetActual} onSetValue={onSetValue}
        />
        {!compact && (
          <div className="mt-2 hidden sm:block">
            <HabitDots habit={habit} weekStartsOn={weekStartsOn} />
          </div>
        )}
      </div>

      {/* streak badge */}
      <div className="hidden sm:block shrink-0">
        <StreakBadge streak={streak} category={habit.category} />
      </div>

      {/* 3-dot menu */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenu((v) => !v)}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded-lg text-ink-hint hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Habit options"
        >
          <MoreVertical size={18} />
        </button>
        {menu && (
          <div className="absolute right-0 top-9 z-20 w-36 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark overflow-hidden">
            <button onClick={() => { setMenu(false); onEdit(habit); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink dark:text-ink-dark hover:bg-purple-50 dark:hover:bg-purple-900/30 text-left">
              <Pencil size={14} /> Edit
            </button>
            <button onClick={() => { setMenu(false); onArchive(habit); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink dark:text-ink-dark hover:bg-black/5 dark:hover:bg-white/10 text-left">
              <Archive size={14} /> Archive
            </button>
            <button onClick={() => { setMenu(false); onDelete(habit); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#D85A30] hover:bg-[#FAECE7] dark:hover:bg-[#3E1B0F] text-left">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      <HabitCheckButton done={done} onClick={() => onToggle(habit.id, dateKey)} />
    </motion.div>
  );
}
