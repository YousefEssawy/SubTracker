import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import {
  subscribeToSpaces,
  addSpace as addSpaceSvc,
  updateSpace as updateSpaceSvc,
  deleteSpace as deleteSpaceSvc,
} from "@/services/spaceService";
import type { Space, SpaceInput, SpaceUpdate } from "@/models/space";

interface SpaceContextValue {
  spaces: Space[];
  loading: boolean;
  addSpace: (data: SpaceInput) => Promise<void>;
  updateSpace: (id: string, data: SpaceUpdate) => Promise<void>;
  deleteSpace: (id: string) => Promise<void>;
  getSpaceById: (id: string) => Space | undefined;
}

const SpaceContext = createContext<SpaceContextValue | null>(null);

export const useSpaces = (): SpaceContextValue => {
  const ctx = useContext(SpaceContext);
  if (!ctx) throw new Error("useSpaces must be used within SpaceProvider");
  return ctx;
};

export const SpaceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSpaces([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToSpaces(
      user.uid,
      (data) => {
        setSpaces(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        toast.error("Failed to sync spaces.");
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user]);

  const addSpace = useCallback(
    async (data: SpaceInput) => {
      if (!user) throw new Error("Not authenticated");
      await addSpaceSvc(user.uid, data);
    },
    [user],
  );

  const updateSpace = useCallback(
    async (id: string, data: SpaceUpdate) => {
      if (!user) throw new Error("Not authenticated");
      await updateSpaceSvc(user.uid, id, data);
    },
    [user],
  );

  const deleteSpace = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      await deleteSpaceSvc(user.uid, id);
    },
    [user],
  );

  const getSpaceById = useCallback(
    (id: string): Space | undefined => spaces.find((s) => s.id === id),
    [spaces],
  );

  return (
    <SpaceContext.Provider
      value={{
        spaces,
        loading,
        addSpace,
        updateSpace,
        deleteSpace,
        getSpaceById,
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};
