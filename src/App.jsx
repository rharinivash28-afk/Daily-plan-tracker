import React, { useState, useCallback, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { StoreProvider, useStore } from "./store/habitStore.jsx";
import { ToastProvider, useToast } from "./hooks/useToast.jsx";
import { useHabits } from "./hooks/useHabits.js";
import { useTheme } from "./hooks/useTheme.js";

import AppShell from "./components/layout/AppShell.jsx";
import OnboardingFlow from "./components/views/OnboardingFlow.jsx";
import TodayView from "./components/views/TodayView.jsx";
import WeeklyView from "./components/views/WeeklyView.jsx";
import StreaksView from "./components/views/StreaksView.jsx";
import SettingsView from "./components/views/SettingsView.jsx";
import AddHabitModal from "./components/habits/AddHabitModal.jsx";
import AddCategoryModal from "./components/ui/AddCategoryModal.jsx";
import DayCompleteModal from "./components/celebration/DayCompleteModal.jsx";
import { fireConfetti } from "./components/celebration/ConfettiTrigger.jsx";
import ToastContainer from "./components/ui/Toast.jsx";
import Button from "./components/ui/Button.jsx";
import Modal from "./components/ui/Modal.jsx";
import { Flame, BookOpen, BarChart2, CalendarDays, Settings as SettingsIcon } from "lucide-react";

// Lazy-loaded heavier views (charts / journal / calendar)
const AnalyticsView = lazy(() => import("./components/views/AnalyticsView.jsx"));
const JournalView = lazy(() => import("./components/views/JournalView.jsx"));
const CalendarView = lazy(() => import("./components/views/CalendarView.jsx"));

const fade = { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.25 } };

function Loading() {
  return <div className="py-20 text-center text-ink-muted">Loading…</div>;
}

function MoreMenu({ setView }) {
  const items = [
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "streaks", label: "Streaks", icon: Flame },
    { id: "journal", label: "Journal", icon: BookOpen },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold text-ink dark:text-ink-dark">More</h1>
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setView(id)}
            className="p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark flex flex-col items-center gap-2 text-ink dark:text-ink-dark">
            <Icon size={24} className="text-purple-600" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AppInner() {
  const { activeHabits, user, addHabit, updateHabit, deleteHabit, archiveHabit, toggle, setActualTime, addCategory } = useHabits();
  const { state } = useStore();
  const toast = useToast();
  useTheme(); // applies dark class

  const [view, setView] = useState("today");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [celebrate, setCelebrate] = useState(null); // { count, streak }

  const filtered = categoryFilter ? activeHabits.filter((h) => h.category === categoryFilter) : activeHabits;

  const openAdd = useCallback(() => { setEditing(null); setModalOpen(true); }, []);
  const openEdit = useCallback((h) => { setEditing(h); setModalOpen(true); }, []);

  const handleSave = useCallback((data) => {
    if (editing) { updateHabit(editing.id, data); toast.success("Habit updated! ✨"); }
    else { addHabit(data); toast.success("Habit saved! ✨"); }
  }, [editing, addHabit, updateHabit, toast]);

  const handleToggle = useCallback((id, dateKey) => toggle(id, dateKey), [toggle]);
  const handleSetTarget = useCallback((id, time) => updateHabit(id, { targetTime: time }), [updateHabit]);
  const handleSetActual = useCallback((id, time, dateKey) => setActualTime(id, time, dateKey), [setActualTime]);

  const handleDayComplete = useCallback((count, streak) => {
    fireConfetti();
    setCelebrate({ count, streak });
  }, []);

  if (!user.onboardingDone) return <OnboardingFlow />;

  const cardHandlers = {
    onToggle: handleToggle, onSetTarget: handleSetTarget, onSetActual: handleSetActual,
    onEdit: openEdit, onDelete: setConfirmDelete,
    onArchive: (h) => { archiveHabit(h.id); toast.info("Habit archived."); },
  };

  return (
    <AppShell
      view={view} setView={setView}
      categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
      onAddCategory={() => setCatModalOpen(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div key={view} {...fade}>
          {view === "today" && (
            <TodayView
              {...cardHandlers}
              habits={filtered} weekStartsOn={user.weekStartsOn} name={user.name}
              onAdd={openAdd} onDayComplete={handleDayComplete}
            />
          )}
          {view === "calendar" && (
            <Suspense fallback={<Loading />}>
              <CalendarView {...cardHandlers} habits={filtered} weekStartsOn={user.weekStartsOn} journal={state.journal} onAdd={openAdd} />
            </Suspense>
          )}
          {view === "weekly" && <WeeklyView habits={filtered} weekStartsOn={user.weekStartsOn} onToggle={handleToggle} />}
          {view === "streaks" && <StreaksView habits={filtered} />}
          {view === "analytics" && <Suspense fallback={<Loading />}><AnalyticsView habits={filtered} /></Suspense>}
          {view === "journal" && <Suspense fallback={<Loading />}><JournalView onToast={toast} /></Suspense>}
          {view === "settings" && <SettingsView onToast={toast} onAddCategory={() => setCatModalOpen(true)} />}
          {view === "more" && <MoreMenu setView={setView} />}
        </motion.div>
      </AnimatePresence>

      {/* day-complete overlay lives in content area (absolute) */}
      <DayCompleteModal
        open={!!celebrate} count={celebrate?.count || 0} streak={celebrate?.streak || 0}
        onClose={() => setCelebrate(null)}
      />

      <AddHabitModal open={modalOpen} editing={editing} onClose={() => setModalOpen(false)} onSave={handleSave} onToast={toast} />

      <AddCategoryModal open={catModalOpen} onClose={() => setCatModalOpen(false)} onAdd={addCategory} onToast={toast} />

      {/* delete confirm */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="380px">
        <div className="p-5">
          <h3 className="text-lg font-semibold text-ink dark:text-ink-dark">Are you sure?</h3>
          <p className="text-sm text-ink-muted mt-1.5">This will remove <b>{confirmDelete?.name}</b> and all its history.</p>
          <div className="flex justify-end gap-2 mt-5">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => { deleteHabit(confirmDelete.id); toast.info("Habit deleted."); setConfirmDelete(null); }}>Delete</Button>
          </div>
        </div>
      </Modal>

      <ToastContainer />
    </AppShell>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </StoreProvider>
  );
}
