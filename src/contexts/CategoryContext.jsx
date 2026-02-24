import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import {
  subscribeToCategories,
  addCategory as addCategorySvc,
  updateCategory as updateCategorySvc,
  deleteCategory as deleteCategorySvc,
} from "@/services/categoryService";

const CategoryContext = createContext(null);

export const useCategories = () => {
  const ctx = useContext(CategoryContext);
  if (!ctx)
    throw new Error("useCategories must be used within CategoryProvider");
  return ctx;
};

export const CategoryProvider = ({ children }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToCategories(user.uid, (data) => {
      setCategories(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const addCategory = useCallback(
    async (data) => {
      if (!user) throw new Error("Not authenticated");
      await addCategorySvc(user.uid, data);
    },
    [user],
  );

  const updateCategory = useCallback(
    async (id, data) => {
      if (!user) throw new Error("Not authenticated");
      await updateCategorySvc(user.uid, id, data);
    },
    [user],
  );

  const deleteCategory = useCallback(
    async (id) => {
      if (!user) throw new Error("Not authenticated");
      await deleteCategorySvc(user.uid, id);
    },
    [user],
  );

  const getCategoryById = useCallback(
    (id) => categories.find((c) => c.id === id),
    [categories],
  );

  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === "Income"),
    [categories],
  );

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "Expense"),
    [categories],
  );

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        incomeCategories,
        expenseCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};
