import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Flame, Pencil, Trash2, Check, X } from "lucide-react";
import Button from "../ui/Button.jsx";
import { useStore } from "../../store/habitStore.jsx";
import { todayKey, prettyDate, fromKey, lastNDays, KEY } from "../../utils/dates.js";
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

  // editing a PAST entry
  const [editKey, setEditKey] = useState(null);
  const [editMood, setEditMood] = useState(2);
  const [editText, setEditText] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);

  // auto-resize today's textarea
  useEffect(() => {
    const ta = taRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.max(120, ta.scrollHeight) + "px"; }
  }, [text]);

  // debounced autosave of today's entry
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (text.trim() || mood !== 2) dispatch({ type: "SET_JOURNAL", dateKey: tKey, entry: { mood, text } });
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

  // ---- stats: journaling streak + 14-day mood trend ----
  const streak = useMemo(() => {
    let s = 0;
    for (let i = 0; i < 400; i++) {
      const k = KEY(new Date(Date.now() - i * 86400000));
      const e = state.journal[k];
      const has = e && (e.text?.trim() || e.mood != null);
      if (i === 0 && !has) continue; // today not written yet doesn't break it
      if (has) s++; else break;
    }
    return s;
  }, [state.journal]);

  const trend = useMemo(
    () => lastNDays(14).map((d) => {
      const e = state.journal[KEY(d)];
      return { date: d, mood: e ? e.mood : null };
    }),
    [state.journal]
  );
  const entryCount = Object.keys(state.journal).filter((k) => {
    const e = state.journal[k];
    return e && (e.text?.trim() || e.mood != null);
  }).length;

  // ---- edit/delete past ----
  const startEdit = (k, e) => { setEditKey(k); setEditMood(e.mood ?? 2); setEditText(e.text || ""); };
  const saveEdit = () => {
    dispatch({ type: "SET_JOURNAL", dateKey: editKey, entry: { mood: editMood, text: editText } });
    setEditKey(null); onToast && onToast.success("Updated! ✨");
  };
  const doDelete = (k) => {
    const next = { ...state.journal };
    delete next[k];
    dispatch({ type: "IMPORT", data: { user: state.user, habits: state.habits, journal: next } });
    setConfirmDel(null); onToast && onToast.info("Entry deleted.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-ink dark:text-ink-dark">Journal</h1>
        {streak > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-accent-soft text-accent">
            <Flame size={15} /> {streak}-day streak
          </span>
        )}
      </div>

      {/* mood trend */}
      {entryCount > 0 && (
        <div className="p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-ink dark:text-ink-dark">Mood — last 14 days</h3>
            <span className="text-xs text-ink-muted">{entryCount} {entryCount === 1 ? "entry" : "entries"}</span>
          </div>
          <div className="flex items-end justify-between gap-1 h-20">
            {trend.map((t, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                {t.mood != null ? (
                  <span className="text-base leading-none" title={prettyDate(t.date)}>{MOODS[t.mood]}</span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-hint/30" />
                )}
                <div className="w-full rounded-sm bg-accent-soft" style={{ height: t.mood != null ? `${(t.mood + 1) * 12}px` : "3px" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* today's entry — always fresh */}
      <div className="p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink dark:text-ink-dark">{prettyDate(fromKey(tKey))}</h3>
          <span className="text-xs font-medium text-accent">Today</span>
        </div>

        <div className="flex gap-2 mt-3">
          {MOODS.map((m, i) => (
            <button key={i} onClick={() => setMood(i)} className="relative text-2xl py-1 transition-transform"
              style={{ transform: mood === i ? "scale(1.3)" : "scale(1)" }}>
              {m}
              {mood === i && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-accent" />}
            </button>
          ))}
        </div>

        <textarea
          ref={taRef} value={text} onChange={(e) => setText(e.target.value)}
          placeholder={prompt}
          className="auto-resize w-full mt-4 px-3.5 py-3 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-ink-hint">{text.trim() ? `${text.trim().split(/\s+/).length} words` : "Auto-saves as you type"}</span>
          <Button onClick={saveNow}>Save entry</Button>
        </div>
      </div>

      {/* past entries */}
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
              const editing = editKey === k;
              return (
                <div key={k} className="p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink dark:text-ink-dark">{prettyDate(fromKey(k))}</span>
                    {!editing && (
                      <div className="flex items-center gap-1">
                        <span className="text-xl mr-1">{MOODS[e.mood] ?? "🙂"}</span>
                        <button onClick={() => startEdit(k, e)} className="p-1.5 rounded-md text-ink-muted hover:bg-black/5 dark:hover:bg-white/10 hover:text-accent"><Pencil size={14} /></button>
                        <button onClick={() => setConfirmDel(k)} className="p-1.5 rounded-md text-ink-muted hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#D85A30]"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>

                  {editing ? (
                    <div className="mt-2">
                      <div className="flex gap-1.5 mb-2">
                        {MOODS.map((m, i) => (
                          <button key={i} onClick={() => setEditMood(i)} className="text-xl transition-transform" style={{ transform: editMood === i ? "scale(1.25)" : "scale(1)", opacity: editMood === i ? 1 : 0.5 }}>{m}</button>
                        ))}
                      </div>
                      <textarea value={editText} onChange={(ev) => setEditText(ev.target.value)} rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-purple-400 bg-bg-light dark:bg-bg-dark text-ink dark:text-ink-dark text-sm focus:outline-none" />
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setEditKey(null)} className="px-3 py-1.5 rounded-lg text-sm text-ink-muted border border-black/[0.08] dark:border-white/[0.08]">Cancel</button>
                        <button onClick={saveEdit} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-accent flex items-center gap-1"><Check size={14} /> Save</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-ink-muted mt-1 whitespace-pre-wrap">{e.text || "No notes."}</p>
                  )}

                  {confirmDel === k && !editing && (
                    <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-[#D85A30]/[0.06] border border-[#D85A30]/30">
                      <span className="text-xs text-ink dark:text-ink-dark flex-1">Delete this entry?</span>
                      <button onClick={() => setConfirmDel(null)} className="px-2.5 py-1 rounded-md text-xs text-ink-muted border border-black/[0.08] dark:border-white/[0.08]">Cancel</button>
                      <button onClick={() => doDelete(k)} className="px-2.5 py-1 rounded-md text-xs font-semibold text-white bg-[#D85A30]">Delete</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
