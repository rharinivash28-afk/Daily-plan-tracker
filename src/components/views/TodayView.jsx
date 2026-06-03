import React, { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import HabitCard from "../habits/HabitCard.jsx";
import Heatmap from "../habits/Heatmap.jsx";
import ProgressRing from "../ui/ProgressRing.jsx";
import Button from "../ui/Button.jsx";
import { greeting, prettyDate, todayKey, fromKey } from "../../utils/dates.js";
import { isHabitScheduledOn, isCompletedOn, dayCompletion, getStreak, streakBrokeYesterday } from "../../utils/streakLogic.js";

function StatPill({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-bg-light dark:bg-white/5">
      <span className="text-lg">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-ink-muted">{label}</div>
        <div className="text-sm font-semibold text-ink dark:text-ink-dark">{value}</div>
      </div>
    </div>
  );
}

export default function TodayView({ habits, weekStartsOn, name, onAdd, onEdit, onDelete, onArchive, onToggle, onSetTarget, onSetActual, onDayComplete }) {
  const tKey = todayKey();
  const tDate = fromKey(tKey);
  const [focus, setFocus] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  const scheduled = useMemo(
    () => habits.filter((h) => !h.archived && isHabitScheduledOn(h, tDate)),
    [habits, tKey]
  );

  const { done, total, pct } = useMemo(() => dayCompletion(habits, tDate), [habits, tKey]);

  // Stats
  const bestStreak = useMemo(() => {
    let best = 0;
    habits.forEach((h) => { const s = getStreak(h); if (s > best) best = s; });
    return best;
  }, [habits, tKey]);

  const totalCompletions = useMemo(
    () => habits.reduce((acc, h) => acc + Object.values(h.completions || {}).filter(Boolean).length, 0),
    [habits]
  );

  const brokenHabit = useMemo(
    () => habits.find((h) => !h.archived && streakBrokeYesterday(h, tDate, 3)),
    [habits, tKey]
  );

  // Sort: incomplete first, completed drift to bottom (layout animates it)
  const ordered = useMemo(() => {
    const incomplete = scheduled.filter((h) => !isCompletedOn(h, tDate));
    const complete = scheduled.filter((h) => isCompletedOn(h, tDate));
    return [...incomplete, ...complete];
  }, [scheduled, tKey]);

  const focusIds = useMemo(
    () => new Set(scheduled.filter((h) => !isCompletedOn(h, tDate)).slice(0, 3).map((h) => h.id)),
    [scheduled, tKey]
  );

  // Detect "all done" transition for celebration.
  const allDone = total > 0 && done === total;
  useEffect(() => {
    if (allDone) onDayComplete(total, bestStreak);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  // Empty state
  if (scheduled.length === 0 && habits.filter((h) => !h.archived).length === 0) {
    return (
      <div className="grid place-items-center text-center py-20">
        <div className="text-6xl mb-4">🌱</div>
        <h2 className="text-xl font-bold text-ink dark:text-ink-dark">Your journey starts here</h2>
        <p className="mt-2 text-ink-muted max-w-xs">Add your first habit and check it off today.</p>
        <Button size="lg" className="mt-6" onClick={onAdd}><Plus size={18} /> Add your first habit</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* top bar */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-ink-dark">{greeting()}, {name || "friend"} 👋</h1>
          <p className="text-sm text-ink-muted mt-0.5">{prettyDate(tDate)}</p>
        </div>
        <Button variant="outline" onClick={onAdd}><Plus size={18} /> Add habit</Button>
      </div>

      {/* streak broken banner */}
      <AnimatePresence>
        {brokenHabit && !dismissedBanner && (
          <motion.div
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FAEEDA] dark:bg-[#352005] text-[#633806] dark:text-[#E5BE78]"
          >
            <span className="text-sm flex-1">Yesterday's streak broke for <b>{brokenHabit.name}</b> — but today is a fresh start 💪</span>
            <button onClick={() => setDismissedBanner(true)} className="p-1 rounded-md hover:bg-black/5"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* hero card */}
      <div className="p-5 sm:p-6 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark flex flex-col sm:flex-row items-center gap-6">
        <ProgressRing pct={pct} />
        <div className="flex-1 grid grid-cols-1 gap-2.5 w-full">
          <StatPill icon="🔥" label="Best streak" value={`${bestStreak} day${bestStreak === 1 ? "" : "s"}`} />
          <StatPill icon="✅" label="Today" value={`${done} of ${total} done`} />
          <StatPill icon="📅" label="Total completions" value={totalCompletions} />
        </div>
      </div>

      {/* habits */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-ink dark:text-ink-dark">Today's habits</h2>
          <div className="flex items-center gap-2">
            {focus && <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-600 text-white">Focus mode on</span>}
            <button onClick={() => setFocus((v) => !v)} className="text-sm font-medium text-purple-600 hover:underline">
              {focus ? "Exit focus" : "Focus mode"}
            </button>
          </div>
        </div>

        {scheduled.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-black/[0.08] dark:border-white/[0.08] text-ink-muted">
            Nothing scheduled today. Enjoy the rest! ✨
          </div>
        ) : (
          <motion.div layout className="space-y-2.5">
            {ordered.map((h) => (
              <HabitCard
                key={h.id} habit={h} dateKey={tKey}
                weekStartsOn={weekStartsOn}
                dimmed={focus && !focusIds.has(h.id)}
                onToggle={onToggle} onSetTarget={onSetTarget} onSetActual={onSetActual}
                onEdit={onEdit} onDelete={onDelete} onArchive={onArchive}
              />
            ))}
          </motion.div>
        )}
      </div>

      <Heatmap habits={habits} />
    </div>
  );
}
