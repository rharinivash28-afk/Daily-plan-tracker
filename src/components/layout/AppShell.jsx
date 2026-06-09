import React from "react";
import Sidebar from "./Sidebar.jsx";
import BottomNav from "./BottomNav.jsx";

export default function AppShell({ view, setView, categoryFilter, setCategoryFilter, onAddCategory, children }) {
  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar view={view} setView={setView} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} onAddCategory={onAddCategory} />
      {/* relative wrapper so the day-complete overlay (absolute, not fixed) fills content */}
      <main className="relative flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32 md:pb-10">
          {children}
        </div>
      </main>
      <BottomNav view={view} setView={setView} />
    </div>
  );
}
