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
    (id, dateKey = todayKey()) => dispatch({ type: "TOGGLE_COMPLETION", id, dateKey }),
    [dispatch]
  );

  return {
    habits, activeHabits, user: state.user,
    addHabit, addHabits, updateHabit, deleteHabit, archiveHabit, toggle,
  };
}
