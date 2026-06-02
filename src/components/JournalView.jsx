import React, { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { getToday, formatLong, fromKey } from "../utils/dates.js";
import { MOODS } from "../utils/constants.js";

export default function JournalView() {
  // entries: { "YYYY-MM-DD": { mood: number, text: string } }
  const [entries, setEntries] = useLocalStorage("habitflow.journal", {});
  const todayKey = getToday();
  const todayEntry = entries[todayKey] || { mood: 2, text: "" };
  const [draft, setDraft] = useState(todayEntry.text);
  const [mood, setMood] = useState(todayEntry.mood);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setEntries((prev) => ({ ...prev, [todayKey]: { mood, text: draft } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const past = Object.entries(entries)
    .filter(([k]) => k !== todayKey)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1));

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-ink">Journal</h2>

      {/* Today's entry */}
      <div className="card-border bg-white/85 backdrop-blur rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg text-ink">{formatLong(todayKey)}</h3>
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50 mb-2">How was your day?</p>
          <div className="flex gap-2">
            {MOODS.map((m, i) => (
              <button
                key={i}
                onClick={() => setMood(i)}
                className={`w-12 h-12 rounded-lg text-2xl grid place-items-center transition-all ${
                  mood === i ? "ring-2 ring-purple-mid bg-purple-light scale-105" : "hover:bg-ink/5"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What went well? What's on your mind?"
          rows={5}
          className="w-full px-3 py-2.5 rounded-md card-border bg-paper text-ink resize-none focus:outline-none focus:ring-2 focus:ring-purple-mid/40"
        />

        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={save}
            className="px-5 py-2 rounded-md font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#7F77DD,#534AB7)" }}
          >
            Save entry
          </button>
          {saved && <span className="text-sm text-teal font-medium anim-fade-in">Saved ✓</span>}
        </div>
      </div>

      {/* Past entries */}
      {past.length > 0 && (
        <div>
          <h3 className="font-display text-lg text-ink mb-3">Past entries</h3>
          <div className="space-y-3">
            {past.map(([k, e]) => (
              <div key={k} className="card-border bg-white/75 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-ink/80 text-sm">{formatLong(k)}</span>
                  <span className="text-2xl">{MOODS[e.mood] ?? "🙂"}</span>
                </div>
                {e.text ? (
                  <p className="text-sm text-ink/70 whitespace-pre-wrap">{e.text}</p>
                ) : (
                  <p className="text-sm text-ink/35 italic">No notes.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
