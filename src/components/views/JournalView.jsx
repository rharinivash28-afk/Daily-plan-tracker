import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import Button from "../ui/Button.jsx";
import { useStore } from "../../store/habitStore.jsx";
import { todayKey, prettyDate, fromKey, format } from "../../utils/dates.js";
import { randomPrompt } from "../../utils/quotes.js";

const MOODS = ["😔", "😐", "🙂", "😊", "🤩"];

export default function JournalView({ onToast }) {
  const { state, dispatch } = useStore();
  const tKey = todayKey();
  const existing = state.journal[tKey] || { mood: 2, text: "" };
  const [mood, setMood] = useState(existing.mood);
  const [text, setText] = useState(existing.text);
  const prompt = useMemo(() => randomPrompt(), []);
  const taRef = useRef(null);
  const debounceRef = useRef(null);
  const [expanded, setExpanded] = useState(null);

  // auto-resize
  useEffect(() => {
    const ta = taRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.max(120, ta.scrollHeight) + "px"; }
  }, [text]);

  // debounced autosave
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch({ type: "SET_JOURNAL", dateKey: tKey, entry: { mood, text } });
    }, 500);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, text]);

  const saveNow = () => {
    dispatch({ type: "SET_JOURNAL", dateKey: tKey, entry: { mood, text } });
    onToast && onToast.success("Entry saved! ✨");
  };

  const past = Object.entries(state.journal)
    .filter(([k]) => k !== tKey)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink dark:text-ink-dark">Journal</h1>

      <div className="p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark">
        <h3 className="text-sm font-semibold text-ink dark:text-ink-dark">{prettyDate(fromKey(tKey))}</h3>

        <div className="flex gap-2 mt-3">
          {MOODS.map((m, i) => (
            <button key={i} onClick={() => setMood(i)} className="relative text-2xl py-1 transition-transform"
              style={{ transform: mood === i ? "scale(1.3)" : "scale(1)" }}>
              {m}
              {mood === i && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-purple-600" />}
            </button>
          ))}
        </div>

        <textarea
          ref={taRef} value={text} onChange={(e) => setText(e.target.value)}
          placeholder={prompt}
          className="auto-resize w-full mt-4 px-3.5 py-3 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <div className="mt-3"><Button onClick={saveNow}>Save entry</Button></div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink dark:text-ink-dark mb-3">Past entries</h3>
        {past.length === 0 ? (
          <div className="grid place-items-center text-center py-12 rounded-2xl border border-black/[0.08] dark:border-white/[0.08]">
            <BookOpen size={36} className="text-purple-400 mb-2" />
            <p className="text-ink-muted text-sm">No past entries yet. Start reflecting today ✨</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {past.map(([k, e]) => {
              const open = expanded === k;
              return (
                <button key={k} onClick={() => setExpanded(open ? null : k)}
                  className="w-full text-left p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink dark:text-ink-dark">{prettyDate(fromKey(k))}</span>
                    <span className="text-xl">{MOODS[e.mood] ?? "🙂"}</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="text-sm text-ink-muted mt-2 whitespace-pre-wrap overflow-hidden">
                        {e.text || "No notes."}
                      </motion.p>
                    ) : (
                      <p className="text-sm text-ink-muted mt-1 truncate">{e.text || "No notes."}</p>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
