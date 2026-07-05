import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import {
  subscribeToCategories,
  addCategory as addCategorySvc,
  updateCategory as updateCategorySvc,
  deleteCategory as deleteCategorySvc,
} from "@/services/categoryService";
import type {
  Category,
  CategoryInput,
  CategoryUpdate,
} from "@/models/category";

interface CategoryContextValue {
  categories: Category[];
  loading: boolean;
  incomeCategories: Category[];
  expenseCategories: Category[];
  addCategory: (data: CategoryInput) => Promise<void>;
  updateCategory: (id: string, data: CategoryUpdate) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
}

const CategoryContext = createContext<CategoryContextValue | null>(null);

export const useCategories = (): CategoryContextValue => {
  const ctx = useContext(CategoryContext);
  if (!ctx)
    throw new Error("useCategories must be used within CategoryProvider");
  return ctx;
};

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToCategories(
      user.uid,
      (data) => {
        setCategories(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        toast.error("Failed to sync categories.");
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user]);

  const addCategory = useCallback(
    async (data: CategoryInput) => {
      if (!user) throw new Error("Not authenticated");
      await addCategorySvc(user.uid, data);
    },
    [user],
  );

  const updateCategory = useCallback(
    async (id: string, data: CategoryUpdate) => {
      if (!user) throw new Error("Not authenticated");
      await updateCategorySvc(user.uid, id, data);
    },
    [user],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      await deleteCategorySvc(user.uid, id);
    },
    [user],
  );

  const getCategoryById = useCallback(
    (id: string): Category | undefined => categories.find((c) => c.id === id),
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
