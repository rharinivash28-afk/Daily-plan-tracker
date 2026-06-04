import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check } from "lucide-react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import EmojiPicker from "../ui/EmojiPicker.jsx";
import { allCategories, catColors } from "../../utils/colors.js";
import { DOW_LABELS } from "../../utils/dates.js";

const UI_TO_JS = [1, 2, 3, 4, 5, 6, 0]; // Mon-first columns -> JS day index

// Custom, visible category dropdown with colored dots + checkmark.
function CategorySelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cats = allCategories();
  const current = cats.find((c) => c.key === value) || cats[0];

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2.5 pl-3.5 pr-3 py-2.5 rounded-xl border bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark transition-colors ${open ? "border-accent ring-2 ring-purple-400" : "border-black/[0.08] dark:border-white/[0.08] hover:border-purple-200"}`}>
        <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: current.dot }} />
        <span className="flex-1 text-left text-sm font-medium">{current.label}</span>
        <ChevronDown size={18} className={`text-ink-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-1.5 w-full max-h-60 overflow-y-auto rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark p-1.5"
            style={{ boxShadow: "0 12px 36px rgba(31,38,80,0.18)" }}
          >
            {cats.map((c) => {
              const active = c.key === value;
              return (
                <button key={c.key} type="button"
                  onClick={() => { onChange(c.key); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left transition-colors ${active ? "bg-accent-soft" : "hover:bg-black/5 dark:hover:bg-white/10"}`}>
                  <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: c.dot }} />
                  <span className="flex-1 font-medium text-ink dark:text-ink-dark">{c.label}</span>
                  {active && <Check size={16} className="text-accent" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AddHabitModal({ open, editing, onClose, onSave, onToast }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [category, setCategory] = useState("health");
  const [frequency, setFrequency] = useState("daily");
  const [customDays, setCustomDays] = useState([1, 3, 5]);
  const [targetType, setTargetType] = useState("none"); // none | time | number | duration
  const [targetTime, setTargetTime] = useState("");
  const [goal, setGoal] = useState("");
  const [unit, setUnit] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name); setEmoji(editing.emoji); setCategory(editing.category);
      setFrequency(editing.frequency); setCustomDays(editing.customDays?.length ? editing.customDays : [1, 3, 5]);
      setTargetType(editing.targetType || "none"); setTargetTime(editing.targetTime || "");
      setGoal(editing.goal ?? ""); setUnit(editing.unit || "");
    } else {
      setName(""); setEmoji("🎯"); setCategory("health"); setFrequency("daily");
      setCustomDays([1, 3, 5]); setTargetType("none"); setTargetTime(""); setGoal(""); setUnit("");
    }
    setShake(false);
  }, [open, editing]);

  const toggleDay = (js) =>
    setCustomDays((prev) => (prev.includes(js) ? prev.filter((d) => d !== js) : [...prev, js]));

  const submit = () => {
    if (!name.trim()) {
      setShake(true);
      onToast && onToast.error("Give this habit a name first 👆");
      setTimeout(() => setShake(false), 500);
      return;
    }
    let days = [];
    if (frequency === "custom") days = [...customDays].sort();
    const payload = {
      name, emoji, category, frequency, customDays: days,
      targetType,
      targetTime: targetType === "time" ? targetTime : "",
      goal: (targetType === "number" || targetType === "duration") ? (Number(goal) || (targetType === "duration" ? 10 : 1)) : "",
      unit: targetType === "number" ? unit : "",
      duration: targetType === "duration" && goal ? `${goal} min` : "",
    };
    onSave(payload);
    onClose();
  };

  const TARGET_TYPES = [
    { id: "none", label: "Just check off", hint: "Yes / No", icon: "✅" },
    { id: "time", label: "Time of day", hint: "e.g. 6:00 AM", icon: "🕐" },
    { id: "number", label: "A number", hint: "e.g. 8 glasses", icon: "🔢" },
    { id: "duration", label: "Minutes", hint: "e.g. 30 min", icon: "⏱️" },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        <h2 className="text-lg font-semibold text-ink dark:text-ink-dark">{editing ? "Edit habit" : "New habit"}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-ink-muted hover:bg-black/5 dark:hover:bg-white/10"><X size={18} /></button>
      </div>

      <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
        {/* name */}
        <motion.div animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}>
          <label className="block text-sm font-medium mb-1.5 text-ink dark:text-ink-dark">Habit name</label>
          <input
            autoFocus value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Read for 30 minutes"
            className={`w-full px-3.5 py-2.5 rounded-xl border bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-purple-400 ${shake ? "border-[#D85A30]" : "border-black/[0.08] dark:border-white/[0.08]"}`}
          />
        </motion.div>

        {/* emoji */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink dark:text-ink-dark">Icon</label>
          <EmojiPicker value={emoji} onChange={setEmoji} />
        </div>

        {/* category */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink dark:text-ink-dark">Category</label>
          <CategorySelect value={category} onChange={setCategory} />
        </div>

        {/* frequency */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink dark:text-ink-dark">Frequency</label>
          <div className="flex gap-2">
            {[["daily", "Daily"], ["weekdays", "Weekdays"], ["custom", "Custom"]].map(([id, lbl]) => (
              <button key={id} onClick={() => setFrequency(id)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${frequency === id ? "bg-purple-600 text-white" : "border border-black/[0.08] dark:border-white/[0.08] text-ink-muted"}`}>
                {lbl}
              </button>
            ))}
          </div>
          {frequency === "custom" && (
            <div className="mt-3 flex gap-1.5">
              {DOW_LABELS.map((d, i) => {
                const js = UI_TO_JS[i];
                const on = customDays.includes(js);
                return (
                  <button key={i} onClick={() => toggleDay(js)}
                    className={`flex-1 aspect-square rounded-lg text-sm font-semibold transition-colors ${on ? "bg-purple-400 text-white" : "border border-black/[0.08] dark:border-white/[0.08] text-ink-hint"}`}>
                    {d}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* target type */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink dark:text-ink-dark">How do you want to track it?</label>
          <div className="grid grid-cols-2 gap-2">
            {TARGET_TYPES.map((t) => (
              <button key={t.id} type="button" onClick={() => setTargetType(t.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-colors ${targetType === t.id ? "border-purple-600 bg-purple-50 dark:bg-purple-900/30" : "border-black/[0.08] dark:border-white/[0.08] hover:border-purple-200"}`}>
                <span className="text-lg">{t.icon}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink dark:text-ink-dark">{t.label}</span>
                  <span className="block text-[11px] text-ink-muted truncate">{t.hint}</span>
                </span>
              </button>
            ))}
          </div>

          {/* type-specific fields */}
          {targetType === "time" && (
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1.5 text-ink dark:text-ink-dark">Target time</label>
              <input type="time" value={targetTime} onChange={(e) => setTargetTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
          )}
          {targetType === "number" && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-ink dark:text-ink-dark">Daily goal</label>
                <input type="number" min="1" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. 8"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-ink dark:text-ink-dark">Unit</label>
                <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. glasses"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
            </div>
          )}
          {targetType === "duration" && (
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1.5 text-ink dark:text-ink-dark">Goal (minutes)</label>
              <input type="number" min="1" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. 30"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t border-black/[0.06] dark:border-white/[0.08]">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={submit}>{editing ? "Update" : "Save"}</Button>
      </div>
    </Modal>
  );
}
