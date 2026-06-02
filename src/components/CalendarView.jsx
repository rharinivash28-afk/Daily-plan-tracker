import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getMonthGrid, toKey, getToday, formatLong, fromKey } from "../utils/dates.js";
import { DAY_LABELS, categoryColor, categorySoft } from "../utils/constants.js";
import HabitCard from "./HabitCard.jsx";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Day-detail panel shown when a date is tapped.
function DayDetail({ dateKey, store, onClose, onEdit, onDelete }) {
  const { habitsForDate, dayProgress, toggle } = store;
  const due = habitsForDate(dateKey);
  const { done, total, pct } = dayProgress(dateKey);
  const isFuture = fromKey(dateKey) > fromKey(getToday());

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-sm anim-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md h-full bg-paper overflow-y-auto anim-modal-in shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-paper/95 backdrop-blur px-5 py-4 border-b border-ink/10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl text-ink">{formatLong(dateKey)}</h2>
            <p className="text-sm text-ink/55 mt-0.5">{done}/{total} done · {pct}%</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-ink/5 text-ink/50"><X size={18} /></button>
        </div>

        <div className="p-5">
          {isFuture && (
            <div className="mb-3 text-xs text-ink/45 bg-ink/5 rounded-md px-3 py-2">
              This day is in the future — you can plan ahead or mark early.
            </div>
          )}
          {due.length === 0 ? (
            <div className="text-center text-ink/45 py-10">No habits scheduled this day.</div>
          ) : (
            <div className="space-y-2.5">
              {due.map((h, i) => (
                <HabitCard
                  key={h.id} habit={h} dateKey={dateKey}
                  onToggle={toggle} onEdit={onEdit} onDelete={onDelete} delay={i * 40}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CalendarView({ store, onEdit, onDelete }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(null);

  const grid = getMonthGrid(year, month);
  const today = getToday();
  const { dayProgress } = store;

  const prev = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const intensity = (key) => {
    const { done } = dayProgress(key);
    if (done === 0) return null;
    if (done <= 1) return "#D5D0F3";
    if (done <= 2) return "#B0A6E6";
    if (done <= 4) return "#7F77DD";
    return "#534AB7";
  };

  return (
    <div className="space-y-5">
      <div className="card-border bg-white/80 backdrop-blur rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl text-ink">{MONTHS[month]} {year}</h2>
          <div className="flex items-center gap-1">
            <button onClick={prev} className="p-2 rounded-md hover:bg-ink/5 text-ink/60"><ChevronLeft size={18} /></button>
            <button
              onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }}
              className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-ink/5 text-ink/60"
            >Today</button>
            <button onClick={next} className="p-2 rounded-md hover:bg-ink/5 text-ink/60"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="text-center text-[11px] font-bold uppercase text-ink/35">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {grid.flat().map((cell) => {
            const isToday = cell.key === today;
            const fill = intensity(cell.key);
            const { done, total } = dayProgress(cell.key);
            const dayNum = fromKey(cell.key).getDate();
            return (
              <button
                key={cell.key}
                onClick={() => setSelected(cell.key)}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all hover:scale-[1.04] hover:ring-2 hover:ring-purple-mid/40 ${
                  cell.inMonth ? "text-ink" : "text-ink/25"
                } ${isToday ? "ring-2 ring-purple-dark" : "card-border"}`}
                style={fill ? { background: fill, color: "#fff" } : { background: cell.inMonth ? "rgb(var(--c-surface))" : "transparent" }}
              >
                <span className={`font-semibold ${isToday && !fill ? "text-purple-dark" : ""}`}>{dayNum}</span>
                {total > 0 && (
                  <span className={`text-[9px] mt-0.5 ${fill ? "text-white/80" : "text-ink/40"}`}>{done}/{total}</span>
                )}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-ink/45">Tap any date to open that day and check off its habits.</p>
      </div>

      {selected && (
        <DayDetail
          dateKey={selected} store={store}
          onClose={() => setSelected(null)} onEdit={onEdit} onDelete={onDelete}
        />
      )}
    </div>
  );
}
