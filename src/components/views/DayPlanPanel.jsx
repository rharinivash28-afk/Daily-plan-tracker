import React from "react";
import { Plus } from "lucide-react";
import HabitCard from "../habits/HabitCard.jsx";
import Button from "../ui/Button.jsx";
import { prettyDate, fromKey, todayKey } from "../../utils/dates.js";
import { isHabitScheduledOn, dayCompletion } from "../../utils/streakLogic.js";

const MOODS = ["😔", "😐", "🙂", "😊", "🤩"];

// One day's full plan. Used inside the calendar side panel AND the full-screen view.
export default function DayPlanPanel({ dateKey, habits, weekStartsOn, journal, onToggle, onSetTarget, onSetActual, onSetValue, onEdit, onDelete, onArchive, onAdd }) {
  const date = fromKey(dateKey);
  const due = habits.filter((h) => !h.archived && isHabitScheduledOn(h, date));
  const { done, total, pct } = dayCompletion(habits, date);
  const isToday = dateKey === todayKey();
  const entry = journal?.[dateKey];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-ink dark:text-ink-dark">{prettyDate(date)}</h2>
        <p className="text-sm text-ink-muted mt-0.5">
          {isToday && <span className="text-purple-600 font-medium">Today · </span>}
          {total > 0 ? `${done}/${total} done · ${pct}%` : "Nothing scheduled"}
        </p>
      </div>

      {total > 0 && (
        <div className="h-2 rounded-full bg-purple-100 dark:bg-purple-900/40 overflow-hidden">
          <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      )}

      {due.length === 0 ? (
        <div className="py-10 text-center text-ink-muted text-sm">
          <div className="text-4xl mb-2">🗓️</div>
          No habits scheduled this day.
        </div>
      ) : (
        <div className="space-y-2.5">
          {due.map((h) => (
            <HabitCard
              key={h.id} habit={h} dateKey={dateKey} weekStartsOn={weekStartsOn}
              onToggle={onToggle} onSetTarget={onSetTarget} onSetActual={onSetActual} onSetValue={onSetValue}
              onEdit={onEdit} onDelete={onDelete} onArchive={onArchive}
            />
          ))}
        </div>
      )}

      {entry && (entry.text || entry.mood != null) && (
        <div className="p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-hint">Journal</span>
            <span className="text-xl">{MOODS[entry.mood] ?? ""}</span>
          </div>
          {entry.text && <p className="text-sm text-ink-muted whitespace-pre-wrap">{entry.text}</p>}
        </div>
      )}

      <Button variant="outline" className="w-full" onClick={onAdd}><Plus size={16} /> Add a habit</Button>
    </div>
  );
}
