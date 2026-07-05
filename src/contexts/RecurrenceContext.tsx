import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import {
  subscribeToRecurrences,
  addRecurrence as addRec,
  pauseRecurrence as pauseRec,
  reactivateRecurrence as reactivateRec,
  deleteRecurrence as deleteRec,
} from "@/services/recurrenceService";
import type { Recurrence, RecurrenceInput } from "@/models/recurrence";

interface RecurrenceContextValue {
  recurrences: Recurrence[];
  loading: boolean;
  activeRecurrences: Recurrence[];
  pausedRecurrences: Recurrence[];
  addRecurrence: (data: RecurrenceInput) => Promise<Recurrence>;
  pauseRecurrence: (id: string) => Promise<void>;
  reactivateRecurrence: (
    id: string,
    pattern: string,
    interval: number,
  ) => Promise<void>;
  deleteRecurrence: (id: string) => Promise<void>;
}

const RecurrenceContext = createContext<RecurrenceContextValue | null>(null);

export const RecurrenceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRecurrences([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToRecurrences(
      user.uid,
      (items) => {
        setRecurrences(items);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        toast.error("Failed to sync recurrences.");
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user]);

  // Note: legacy recurrenceService used isActive boolean; new typed model uses status union.
  // The toRecurrence mapper converts both formats correctly.
  const activeRecurrences = useMemo(
    () => recurrences.filter((r) => r.status === "active"),
    [recurrences],
  );
  const pausedRecurrences = useMemo(
    () => recurrences.filter((r) => r.status === "paused"),
    [recurrences],
  );

  const addRecurrence = async (data: RecurrenceInput): Promise<Recurrence> => {
    if (!user) throw new Error("Not authenticated");
    return addRec(user.uid, data);
  };

  const pauseRecurrence = async (id: string): Promise<void> => {
    if (!user) throw new Error("Not authenticated");
    await pauseRec(user.uid, id);
  };

  const reactivateRecurrence = async (
    id: string,
    pattern: string,
    interval: number,
  ): Promise<void> => {
    if (!user) throw new Error("Not authenticated");
    await reactivateRec(user.uid, id, pattern, interval);
  };

  const deleteRecurrence = async (id: string): Promise<void> => {
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

export const useRecurrences = (): RecurrenceContextValue => {
  const ctx = useContext(RecurrenceContext);
  if (!ctx)
    throw new Error("useRecurrences must be used within RecurrenceProvider");
  return ctx;
};
