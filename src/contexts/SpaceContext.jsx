import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  subscribeToSpaces,
  addSpace as addSpaceSvc,
  updateSpace as updateSpaceSvc,
  deleteSpace as deleteSpaceSvc,
} from "@/services/spaceService";

const SpaceContext = createContext(null);

export const useSpaces = () => {
  const ctx = useContext(SpaceContext);
  if (!ctx) throw new Error("useSpaces must be used within SpaceProvider");
  return ctx;
};

export const SpaceProvider = ({ children }) => {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSpaces([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToSpaces(user.uid, (data) => {
      setSpaces(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const addSpace = useCallback(
    async (data) => {
      if (!user) throw new Error("Not authenticated");
      await addSpaceSvc(user.uid, data);
    },
    [user],
  );

  const updateSpace = useCallback(
    async (id, data) => {
      if (!user) throw new Error("Not authenticated");
      await updateSpaceSvc(user.uid, id, data);
    },
    [user],
  );

  const deleteSpace = useCallback(
    async (id) => {
      if (!user) throw new Error("Not authenticated");
      await deleteSpaceSvc(user.uid, id);
    },
    [user],
  );

  const getSpaceById = useCallback(
    (id) => spaces.find((s) => s.id === id),
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
