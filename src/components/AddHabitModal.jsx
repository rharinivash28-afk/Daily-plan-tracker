import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { EMOJIS, CATEGORY_NAMES, FREQUENCIES, DAY_LABELS, categoryColor } from "../utils/constants.js";

// Maps Monday-based UI columns to JS day indices (0=Sun..6=Sat).
const UI_TO_JS = [1, 2, 3, 4, 5, 6, 0];

export default function AddHabitModal({ open, onClose, onSave, editing }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [category, setCategory] = useState("Health");
  const [frequency, setFrequency] = useState("daily");
  const [customDays, setCustomDays] = useState([1, 3, 5]);
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setEmoji(editing.emoji);
      setCategory(editing.category);
      setFrequency(editing.frequency);
      setCustomDays(editing.customDays || [1, 3, 5]);
      setDuration(editing.duration || "");
    } else if (open) {
      setName(""); setEmoji("🎯"); setCategory("Health");
      setFrequency("daily"); setCustomDays([1, 3, 5]); setDuration("");
    }
  }, [editing, open]);

  if (!open) return null;

  const toggleDay = (jsIdx) =>
    setCustomDays((prev) =>
      prev.includes(jsIdx) ? prev.filter((d) => d !== jsIdx) : [...prev, jsIdx]
    );

  const save = () => {
    let days = [0, 1, 2, 3, 4, 5, 6];
    if (frequency === "weekdays") days = [1, 2, 3, 4, 5];
    if (frequency === "custom") days = customDays.slice().sort();
    onSave({ name, emoji, category, frequency, customDays: days, duration });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink/40 backdrop-blur-sm anim-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl card-border anim-modal-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
          <h2 className="font-display text-xl text-ink">{editing ? "Edit habit" : "New habit"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-ink/5 text-ink/50">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1.5">Habit name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Evening walk"
              autoFocus
              className="w-full px-3 py-2.5 rounded-md card-border bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-purple-mid/40"
            />
          </div>

          {/* Emoji picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1.5">Icon</label>
            <div className="grid grid-cols-10 gap-1.5">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`aspect-square rounded-md text-lg grid place-items-center transition-all ${
                    emoji === e ? "ring-2 ring-purple-mid bg-purple-light" : "hover:bg-ink/5"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1.5">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_NAMES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={
                    category === c
                      ? { background: categoryColor(c), color: "white" }
                      : { background: "rgba(28,26,46,0.05)", color: "rgba(28,26,46,0.6)" }
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1.5">Frequency</label>
            <div className="flex gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFrequency(f.id)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    frequency === f.id ? "bg-purple-dark text-white" : "card-border text-ink/60 hover:bg-ink/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {frequency === "custom" && (
              <div className="mt-3 flex gap-1.5">
                {DAY_LABELS.map((d, i) => {
                  const jsIdx = UI_TO_JS[i];
                  const on = customDays.includes(jsIdx);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleDay(jsIdx)}
                      className={`flex-1 aspect-square rounded-md text-sm font-bold transition-all ${
                        on ? "bg-purple-mid text-white" : "card-border text-ink/45 hover:bg-ink/5"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1.5">
              Target duration <span className="normal-case font-normal text-ink/35">(optional)</span>
            </label>
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 30 min"
              className="w-full px-3 py-2.5 rounded-md card-border bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-purple-mid/40"
            />
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-ink/10">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-md card-border text-ink/70 font-medium hover:bg-ink/5">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-md font-semibold text-white disabled:opacity-40 transition-opacity"
            style={{ background: "linear-gradient(135deg,#7F77DD,#534AB7)" }}
          >
            {editing ? "Save changes" : "Add habit"}
          </button>
        </div>
      </div>
    </div>
  );
}
