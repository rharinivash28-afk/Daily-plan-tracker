import { useCallback, useMemo } from "react";
import { useStore } from "../store/habitStore.jsx";
import { todayKey } from "../utils/dates.js";

export function useHabits() {
  const { state, dispatch } = useStore();

  const habits = state.habits;
  const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits]);

  const addHabit = useCallback((habit) => dispatch({ type: "ADD_HABIT", habit }), [dispatch]);
  const addHabits = useCallback((arr) => dispatch({ type: "ADD_HABITS", habits: arr }), [dispatch]);
  const updateHabit = useCallback((id, patch) => dispatch({ type: "UPDATE_HABIT", id, patch }), [dispatch]);
  const deleteHabit = useCallback((id) => dispatch({ type: "DELETE_HABIT", id }), [dispatch]);
  const archiveHabit = useCallback((id) => dispatch({ type: "ARCHIVE_HABIT", id }), [dispatch]);
  const toggle = useCallback(
    (id, dateKey = todayKey()) => {
      // stamp current clock time only when checking off "today"
      const nowTime = dateKey === todayKey()
        ? new Date().toTimeString().slice(0, 5) // "HH:MM"
        : "";
      dispatch({ type: "TOGGLE_COMPLETION", id, dateKey, nowTime });
    },
    [dispatch]
  );
  const setActualTime = useCallback(
    (id, time, dateKey = todayKey()) => dispatch({ type: "SET_ACTUAL_TIME", id, dateKey, time }),
    [dispatch]
  );
  const addCategory = useCallback((name, paletteIndex) => dispatch({ type: "ADD_CATEGORY", name, paletteIndex }), [dispatch]);
  const renameCategory = useCallback((key, name) => dispatch({ type: "RENAME_CATEGORY", key, name }), [dispatch]);
  const deleteCategory = useCallback((key) => dispatch({ type: "DELETE_CATEGORY", key }), [dispatch]);
  const setUser = useCallback((patch) => dispatch({ type: "SET_USER", patch }), [dispatch]);

  return {
    habits, activeHabits, user: state.user,
    addHabit, addHabits, updateHabit, deleteHabit, archiveHabit, toggle, setActualTime,
    addCategory, renameCategory, deleteCategory, setUser,
  };
}
