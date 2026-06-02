import React, { useState, useRef, useEffect } from "react";
import { Check, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { categoryColor, categorySoft, DAY_LABELS } from "../utils/constants.js";
import { getStreakCount, getWeekDates, isCompleted, isScheduled, getToday } from "../utils/dates.js";

// 7-dot mini week row.
function WeekDots({ habit, dateKey }) {
  const week = getWeekDates(new Date(dateKey + "T00:00:00"));
  const today = getToday();
  return (
    <div className="flex items-center gap-1.5">
      {week.map((dKey, i) => {
        const scheduled = isScheduled(habit, dKey);
        const done = isCompleted(habit, dKey);
        const isToday = dKey === today;
        let cls = "border-ink/15";
        let style = {};
        if (done) {
          cls = "border-transparent";
          style = { background: categoryColor(habit.category) };
        } else if (isToday) {
          cls = "border-ink/40";
        } else if (!scheduled) {
          cls = "border-ink/10 opacity-40";
        }
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full border-2 ${cls}`} style={style} />
            <span className="text-[9px] text-ink/35 font-medium">{DAY_LABELS[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function HabitCard({ habit, dateKey, onToggle, onEdit, onDelete, delay = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [justChecked, setJustChecked] = useState(false);
  const menuRef = useRef(null);

  const done = isCompleted(habit, dateKey);
  const color = categoryColor(habit.category);
  const soft = categorySoft(habit.category);
  const streak = getStreakCount(habit, getToday());

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const handleToggle = () => {
    if (!done) { setJustChecked(true); setTimeout(() => setJustChecked(false), 420); }
    onToggle(habit.id, dateKey);
  };

  return (
    <div
      className="group card-border bg-white/85 backdrop-blur rounded-xl px-4 py-3.5 flex items-center gap-4 anim-slide-in hover:bg-white transition-colors"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* emoji pill */}
      <div
        className="shrink-0 w-11 h-11 rounded-lg grid place-items-center text-xl"
        style={{ background: soft }}
      >
        <span>{habit.emoji}</span>
      </div>

      {/* middle */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={`font-semibold text-[15px] truncate transition-all ${done ? "line-through text-ink/35" : "text-ink"}`}
          >
            {habit.name}
          </h3>
          {habit.duration && (
            <span className="shrink-0 text-[11px] text-ink/40 font-medium">· {habit.duration}</span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-medium" style={{ color }}>{habit.category}</span>
          {streak > 0 && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${streak >= 7 ? "anim-pulse-glow" : ""}`}
              style={{ background: soft, color }}
            >
              🔥 {streak}d
            </span>
          )}
        </div>

        <div className="mt-2.5">
          <WeekDots habit={habit} dateKey={dateKey} />
        </div>
      </div>

      {/* 3-dot menu (hover reveal) */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-ink/5 text-ink/40"
          aria-label="Habit options"
        >
          <MoreVertical size={18} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-9 z-20 w-32 card-border bg-white rounded-lg overflow-hidden anim-fade-in shadow-sm">
            <button
              onClick={() => { setMenuOpen(false); onEdit(habit); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink/80 hover:bg-purple-light text-left"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={() => { setMenuOpen(false); onDelete(habit); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-coral hover:bg-coral/10 text-left"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* big check button */}
      <button
        onClick={handleToggle}
        className={`shrink-0 w-12 h-12 rounded-full grid place-items-center border-2 transition-all duration-300 ${justChecked ? "anim-pop" : ""}`}
        style={
          done
            ? { background: color, borderColor: color, color: "white" }
            : { borderColor: "rgba(28,26,46,0.18)", color: "rgba(28,26,46,0.3)" }
        }
        aria-label={done ? "Mark incomplete" : "Mark complete"}
      >
        <Check size={22} strokeWidth={3} className={done ? "opacity-100" : "opacity-0"} />
      </button>
    </div>
  );
}
