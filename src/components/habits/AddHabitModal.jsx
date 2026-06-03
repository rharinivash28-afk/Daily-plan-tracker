import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import EmojiPicker from "../ui/EmojiPicker.jsx";
import { CATEGORIES, CATEGORY_KEYS } from "../../utils/colors.js";
import { DOW_LABELS } from "../../utils/dates.js";

const UI_TO_JS = [1, 2, 3, 4, 5, 6, 0]; // Mon-first columns -> JS day index

export default function AddHabitModal({ open, editing, onClose, onSave, onToast }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [category, setCategory] = useState("health");
  const [frequency, setFrequency] = useState("daily");
  const [customDays, setCustomDays] = useState([1, 3, 5]);
  const [duration, setDuration] = useState("");
  const [targetTime, setTargetTime] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name); setEmoji(editing.emoji); setCategory(editing.category);
      setFrequency(editing.frequency); setCustomDays(editing.customDays?.length ? editing.customDays : [1, 3, 5]);
      setDuration(editing.duration || ""); setTargetTime(editing.targetTime || "");
    } else {
      setName(""); setEmoji("🎯"); setCategory("health"); setFrequency("daily");
      setCustomDays([1, 3, 5]); setDuration(""); setTargetTime("");
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
    onSave({ name, emoji, category, frequency, customDays: days, duration, targetTime });
    onClose();
  };

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
          <div className="relative">
            <select
              value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none pl-8 pr-3 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {CATEGORY_KEYS.map((k) => <option key={k} value={k}>{CATEGORIES[k].label}</option>)}
            </select>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full" style={{ background: CATEGORIES[category].dot }} />
          </div>
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

        {/* duration + target time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-ink dark:text-ink-dark">Duration</label>
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 30 min"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-ink dark:text-ink-dark">Target time</label>
            <input type="time" value={targetTime} onChange={(e) => setTargetTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t border-black/[0.06] dark:border-white/[0.08]">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={submit}>{editing ? "Update" : "Save"}</Button>
      </div>
    </Modal>
  );
}
