import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";
import {
  subscribeToRecurrences,
  addRecurrence as addRec,
  pauseRecurrence as pauseRec,
  reactivateRecurrence as reactivateRec,
  deleteRecurrence as deleteRec,
} from "@/services/recurrenceService";

const RecurrenceContext = createContext();

export const RecurrenceProvider = ({ children }) => {
  const { user } = useAuth();
  const [recurrences, setRecurrences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRecurrences([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToRecurrences(user.uid, (items) => {
      setRecurrences(items);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const activeRecurrences = useMemo(
    () => recurrences.filter((r) => r.isActive),
    [recurrences],
  );
  const pausedRecurrences = useMemo(
    () => recurrences.filter((r) => !r.isActive),
    [recurrences],
  );

  const addRecurrence = async (data) => {
    if (!user) throw new Error("Not authenticated");
    return addRec(user.uid, data);
  };

  const pauseRecurrence = async (id) => {
    if (!user) throw new Error("Not authenticated");
    await pauseRec(user.uid, id);
  };

  const reactivateRecurrence = async (id, pattern, interval) => {
    if (!user) throw new Error("Not authenticated");
    await reactivateRec(user.uid, id, pattern, interval);
  };

  const deleteRecurrence = async (id) => {
    if (!user) throw new Error("Not authenticated");
    await deleteRec(user.uid, id);
  };

  return (
    <RecurrenceContext.Provider
      value={{
        recurrences,
        loading,
        activeRecurrences,
        pausedRecurrences,
        addRecurrence,
        pauseRecurrence,
        reactivateRecurrence,
        deleteRecurrence,
      }}
    >
      {children}
    </RecurrenceContext.Provider>
  );
};

export const useRecurrences = () => {
  const ctx = useContext(RecurrenceContext);
  if (!ctx)
    throw new Error("useRecurrences must be used within RecurrenceProvider");
  return ctx;
};
