import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Minus, Plus, Pencil } from "lucide-react";
import HabitCheckButton from "./HabitCheckButton.jsx";

const MOODS = ["😔", "😐", "🙂", "😊", "🤩"];

// Renders the right-side control for a habit card based on its tracker type.
export default function TrackerControl({ habit, dateKey, value, done, onToggle, onSetValue }) {
  const type = habit.type || "boolean";

  if (type === "numeric") {
    const target = Number(habit.target || 1);
    const v = Number(value || 0);
    const pct = Math.min(100, Math.round((v / target) * 100));
    return (
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden xs:flex flex-col items-end mr-1">
          <span className="text-sm font-semibold text-ink dark:text-ink-dark tabular-nums">{v}<span className="text-ink-hint">/{target}</span></span>
          {habit.unit && <span className="text-[10px] text-ink-muted">{habit.unit}</span>}
        </div>
        <button onClick={() => onSetValue(habit.id, Math.max(0, v - 1), dateKey)}
          className="w-9 h-9 rounded-full grid place-items-center border border-black/[0.1] dark:border-white/[0.12] text-ink-muted hover:bg-black/5 dark:hover:bg-white/10" aria-label="Decrease">
          <Minus size={16} />
        </button>
        <motion.button whileTap={{ scale: 1.2 }} onClick={() => onSetValue(habit.id, v + 1, dateKey)}
          className="w-9 h-9 rounded-full grid place-items-center text-white" style={{ background: done ? "#534AB7" : "#7F77DD" }} aria-label="Increase">
          {done ? <Check size={16} strokeWidth={3} /> : <Plus size={16} />}
        </motion.button>
      </div>
    );
  }

  if (type === "mood") {
    const v = value == null ? -1 : Number(value);
    return (
      <div className="flex items-center gap-0.5 shrink-0">
        {MOODS.map((m, i) => (
          <button key={i} onClick={() => onSetValue(habit.id, i === v ? "" : i, dateKey)}
            className="text-lg leading-none p-0.5 transition-transform" style={{ transform: v === i ? "scale(1.3)" : "scale(1)", opacity: v === i || v < 0 ? 1 : 0.4 }}>
            {m}
          </button>
        ))}
      </div>
    );
  }

  if (type === "notes") {
    return <NoteControl habit={habit} dateKey={dateKey} value={value} onSetValue={onSetValue} />;
  }

  // boolean
  return <HabitCheckButton done={done} onClick={() => onToggle(habit.id, dateKey)} />;
}

function NoteControl({ habit, dateKey, value, onSetValue }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  useEffect(() => { setDraft(value || ""); }, [value, dateKey]);

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)}
        className="shrink-0 max-w-[160px] flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/[0.1] dark:border-white/[0.12] text-sm text-left hover:bg-black/5 dark:hover:bg-white/10">
        <Pencil size={14} className="text-ink-muted shrink-0" />
        <span className={`truncate ${value ? "text-ink dark:text-ink-dark" : "text-ink-hint"}`}>{value || "Add note"}</span>
      </button>
    );
  }
  return (
    <input
      autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { onSetValue(habit.id, draft.trim(), dateKey); setEditing(false); }}
      onKeyDown={(e) => { if (e.key === "Enter") { onSetValue(habit.id, draft.trim(), dateKey); setEditing(false); } }}
      placeholder="Type a quick note…"
      className="shrink-0 w-44 px-3 py-2 rounded-xl border border-purple-400 bg-bg-light dark:bg-bg-dark text-sm text-ink dark:text-ink-dark focus:outline-none"
    />
  );
}
