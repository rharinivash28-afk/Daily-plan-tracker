import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { Plus, Sparkles } from "lucide-react";

import { useHabits } from "./hooks/useHabits.js";
import { greeting, formatLong, getToday } from "./utils/dates.js";

import Sidebar from "./components/Sidebar.jsx";
import TodayView from "./components/TodayView.jsx";
import CalendarView from "./components/CalendarView.jsx";
import WeeklyView from "./components/WeeklyView.jsx";
import AnalyticsView from "./components/AnalyticsView.jsx";
import StreaksView from "./components/StreaksView.jsx";
import JournalView from "./components/JournalView.jsx";
import AddHabitModal from "./components/AddHabitModal.jsx";

const NAME = "Harini";

export default function App() {
  const store = useHabits();
  const { addHabit, updateHabit, deleteHabit, today } = store;

  const [view, setView] = useState("today");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null); // { habit }
  const prevAllDone = useRef(false);

  // Confetti burst when all of today's habits become complete.
  useEffect(() => {
    const allDone = today.total > 0 && today.done === today.total;
    if (allDone && !prevAllDone.current) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.7 },
        colors: ["#7F77DD", "#534AB7", "#1D9E75", "#D85A30", "#D4537E"],
      });
    }
    prevAllDone.current = allDone;
  }, [today.done, today.total]);

  // Ask for notification permission once (stretch goal).
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      const t = setTimeout(() => { try { Notification.requestPermission(); } catch (e) {} }, 4000);
      return () => clearTimeout(t);
    }
  }, []);

  const openAdd = useCallback(() => { setEditing(null); setModalOpen(true); }, []);
  const openEdit = useCallback((habit) => { setEditing(habit); setModalOpen(true); }, []);

  const handleSave = useCallback((data) => {
    if (editing) updateHabit(editing.id, data);
    else addHabit(data);
  }, [editing, addHabit, updateHabit]);

  const requestDelete = useCallback((habit) => setToast({ habit }), []);
  const confirmDelete = useCallback(() => {
    if (toast) deleteHabit(toast.habit.id);
    setToast(null);
  }, [toast, deleteHabit]);

  const viewProps = { store, onEdit: openEdit, onDelete: requestDelete };

  const renderView = () => {
    switch (view) {
      case "today":     return <TodayView {...viewProps} onSelectDate={() => setView("calendar")} />;
      case "calendar":  return <CalendarView {...viewProps} />;
      case "weekly":    return <WeeklyView store={store} />;
      case "analytics": return <AnalyticsView store={store} />;
      case "streaks":   return <StreaksView store={store} />;
      case "journal":   return <JournalView />;
      default:          return <TodayView {...viewProps} onSelectDate={() => setView("calendar")} />;
    }
  };

  return (
    <div className="relative flex min-h-screen" style={{ zIndex: 1 }}>
      <Sidebar active={view} onNavigate={setView} />

      <main className="flex-1 min-w-0 px-5 sm:px-8 py-6 pb-24 md:pb-8 max-w-5xl mx-auto w-full">
        {/* Top bar */}
        <header className="flex flex-wrap items-start justify-between gap-4 mb-7">
          <div>
            <h1 className="font-display text-3xl text-ink flex items-center gap-2">
              {greeting()}, {NAME}
              <Sparkles size={22} className="text-purple-mid" />
            </h1>
            <p className="text-sm text-ink/55 mt-1">
              {formatLong(getToday())} · {today.total - today.done} of {today.total} habits pending
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md font-semibold text-white shrink-0 transition-transform hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg,#7F77DD,#534AB7)" }}
          >
            <Plus size={18} /> Add habit
          </button>
        </header>

        {renderView()}
      </main>

      <AddHabitModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      {/* Delete confirmation toast */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 anim-slide-in">
          <div className="card-border bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
            <span className="text-sm text-ink/80">
              Delete <span className="font-semibold">{toast.habit.name}</span>?
            </span>
            <button onClick={() => setToast(null)} className="px-3 py-1.5 rounded-md text-sm card-border text-ink/60 hover:bg-ink/5">
              Cancel
            </button>
            <button onClick={confirmDelete} className="px-3 py-1.5 rounded-md text-sm font-semibold text-white bg-coral">
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
