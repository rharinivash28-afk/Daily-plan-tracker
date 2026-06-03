import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Clock, CheckCircle2, X, Plus, Minus } from "lucide-react";

// "HH:MM" (24h) -> "6:00 AM"
function pretty(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
}

// Parse "HH:MM" -> { h12, min, ampm }
function parse(t) {
  if (!t) return { h12: 7, min: 0, ampm: "AM" };
  const [h, m] = t.split(":").map(Number);
  return { h12: ((h + 11) % 12) + 1, min: m, ampm: h >= 12 ? "PM" : "AM" };
}

// { h12, min, ampm } -> "HH:MM"
function build(h12, min, ampm) {
  let h = h12 % 12;
  if (ampm === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

// A custom time-picker popover anchored to the chip. Works reliably everywhere.
function TimePickerPopover({ anchorRect, value, onPick, onClear, onClose }) {
  const { h12, min, ampm } = parse(value);
  const [H, setH] = useState(h12);
  const [M, setM] = useState(min);
  const [AP, setAP] = useState(ampm);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, [onClose]);

  // Position: below the chip, clamped to viewport.
  const width = 230;
  let left = anchorRect.left;
  let top = anchorRect.bottom + 6;
  if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
  if (left < 8) left = 8;

  const cell = (key, active, onClick, child) => (
    <button key={key} onClick={onClick}
      className={`py-1.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-purple-600 text-white" : "text-ink dark:text-ink-dark hover:bg-black/5 dark:hover:bg-white/10"}`}>
      {child}
    </button>
  );

  return createPortal(
    <div ref={ref} className="fixed z-[70] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark p-3"
      style={{ left, top, width, boxShadow: "0 10px 40px rgba(0,0,0,0.18)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-ink-muted">Pick a time</span>
        <button onClick={onClose} className="p-1 rounded-md text-ink-hint hover:bg-black/5 dark:hover:bg-white/10"><X size={14} /></button>
      </div>

      <div className="text-center font-bold text-lg text-purple-600 mb-2">{pretty(build(H, M, AP))}</div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-ink-hint mb-1 text-center">Hour</div>
          <div className="grid grid-cols-3 gap-1 max-h-[120px] overflow-y-auto pr-0.5">
            {HOURS.map((h) => cell(`h${h}`, H === h, () => setH(h), h))}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-ink-hint mb-1 text-center">Min</div>
          <div className="grid grid-cols-3 gap-1 max-h-[120px] overflow-y-auto pr-0.5">
            {MINUTES.map((m) => cell(`m${m}`, M === m, () => setM(m), String(m).padStart(2, "0")))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 mt-2">
        {cell("am", AP === "AM", () => setAP("AM"), "AM")}
        {cell("pm", AP === "PM", () => setAP("PM"), "PM")}
      </div>

      <div className="flex items-center gap-2 mt-3">
        {value && (
          <button onClick={() => { onClear(); onClose(); }} className="flex-1 py-2 rounded-lg text-sm font-medium text-ink-muted border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/5 dark:hover:bg-white/10">
            Clear
          </button>
        )}
        <button onClick={() => { onPick(build(H, M, AP)); onClose(); }}
          className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-800">
          Done
        </button>
      </div>
    </div>,
    document.body
  );
}

function TimeChip({ value, onChange, icon, label, tone = "muted" }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const btnRef = useRef(null);

  const toggle = () => {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen((v) => !v);
  };

  const toneCls = tone === "done"
    ? "text-[#1D9E75] bg-[#E1F5EE] dark:bg-[#0A2E25] hover:brightness-95"
    : value
      ? "text-purple-600 bg-purple-50 dark:bg-purple-900/30 hover:brightness-95"
      : "text-ink-hint bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07]";

  return (
    <>
      <button ref={btnRef} type="button" onClick={toggle}
        className={`inline-flex items-center gap-1 pl-1.5 pr-2 py-1 rounded-full text-[11px] font-medium transition ${toneCls}`}>
        {icon}
        <span>{value ? pretty(value) : label}</span>
      </button>
      {open && rect && (
        <TimePickerPopover
          anchorRect={rect} value={value}
          onPick={onChange} onClear={() => onChange("")}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// A +/- counter chip for number/duration targets, with progress toward the goal.
function CounterChip({ habit, dateKey, onSetValue }) {
  const goal = Number(habit.goal) || 0;
  const v = Number((habit.values || {})[dateKey] || 0);
  const reached = goal > 0 && v >= goal;
  const unit = habit.targetType === "duration" ? "min" : (habit.unit || "");
  const tone = reached
    ? "text-[#1D9E75] bg-[#E1F5EE] dark:bg-[#0A2E25]"
    : v > 0 ? "text-purple-600 bg-purple-50 dark:bg-purple-900/30" : "text-ink-hint bg-black/[0.04] dark:bg-white/[0.06]";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full text-[11px] font-medium ${tone}`}>
      <button onClick={() => onSetValue(habit.id, Math.max(0, v - 1), dateKey)}
        className="w-6 h-6 grid place-items-center rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="Decrease">
        <Minus size={12} />
      </button>
      <span className="tabular-nums px-0.5 min-w-[42px] text-center">
        {v}{goal ? `/${goal}` : ""}{unit ? ` ${unit}` : ""}
      </span>
      <button onClick={() => onSetValue(habit.id, v + 1, dateKey)}
        className="w-6 h-6 grid place-items-center rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="Increase">
        <Plus size={12} />
      </button>
    </span>
  );
}

// Renders the right target control per habit.targetType.
// none -> nothing (just the check button elsewhere)
// time -> clock picker (+ actual-time chip when done)
// number/duration -> +/- counter toward a goal
export default function TimeControl({ habit, dateKey, done, onSetTarget, onSetActual, onSetValue }) {
  const type = habit.targetType || "none";
  if (type === "none") return null;

  if (type === "number" || type === "duration") {
    return (
      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
        <CounterChip habit={habit} dateKey={dateKey} onSetValue={onSetValue} />
      </div>
    );
  }

  // time
  const actual = (habit.actualTimes || {})[dateKey] || "";
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
      <TimeChip
        value={habit.targetTime} onChange={(t) => onSetTarget(habit.id, t)}
        icon={<Clock size={12} />} label="Set target"
      />
      {done && (
        <TimeChip
          value={actual} onChange={(t) => onSetActual(habit.id, t, dateKey)}
          icon={<CheckCircle2 size={12} />} label="Add time" tone="done"
        />
      )}
    </div>
  );
}
