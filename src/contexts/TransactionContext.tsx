import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  addTransaction as addTransactionSvc,
  updateTransaction as updateTransactionSvc,
  subscribeToTransactions,
  subscribeToAllTransactions,
} from "@/services/transactionService";
import { computeBalances } from "@/utils/balanceUtils";
import type {
  Transaction,
  TransactionInput,
  TransactionUpdate,
} from "@/models/transaction";
import type { BalanceMap } from "@/models/balance";
import type { TransactionFilters } from "@/utils/balanceUtils";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

interface PaginationControl {
  hasNext: boolean;
  hasPrev: boolean;
  goNext: () => void;
  goPrev: () => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  pageSizeOptions: readonly number[];
}

interface TransactionContextValue {
  transactions: Transaction[];
  loading: boolean;
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  balances: BalanceMap;
  pagination: PaginationControl;
  addTransaction: (data: TransactionInput) => Promise<Transaction>;
  updateTransaction: (id: string, data: TransactionUpdate) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

export const useTransactions = (): TransactionContextValue => {
  const ctx = useContext(TransactionContext);
  if (!ctx)
    throw new Error("useTransactions must be used within TransactionProvider");
  return ctx;
};

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [filters, setFilters] = useState<TransactionFilters>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const cursorStackRef = useRef<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [cursorIndex, setCursorIndex] = useState(-1);
  const [hasNext, setHasNext] = useState(false);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const cursor =
      cursorIndex >= 0 ? cursorStackRef.current[cursorIndex] : null;
    const unsub = subscribeToTransactions(
      user.uid,
      {
        ...filters,
        pageSize: pageSize + 1,
        startAfterDoc: cursor ?? undefined,
      },
      (docs) => {
        if (docs.length > pageSize) {
          setTransactions(docs.slice(0, pageSize));
          setHasNext(true);
        } else {
          setTransactions(docs);
          setHasNext(false);
        }
        setLoading(false);
      },
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters, pageSize, cursorIndex]);

  useEffect(() => {
    if (!user) {
      setAllTransactions([]);
      return;
    }
    const balanceFilters: TransactionFilters = {
      spaceId: filters.spaceId,
      currency: filters.currency,
      dateRange: filters.dateRange,
      type: filters.type,
    };
    const unsub = subscribeToAllTransactions(
      user.uid,
      balanceFilters,
      setAllTransactions,
    );
    return () => unsub();
  }, [
    user,
    filters.spaceId,
    filters.currency,
    filters.dateRange,
    filters.type,
  ]);

  const balances = useMemo(
    () => computeBalances(allTransactions),
    [allTransactions],
  );

  const hasPrev = cursorIndex >= 0;

  const goNext = useCallback(() => {
    if (!hasNext || transactions.length === 0) return;
    setCursorIndex((i) => i + 1);
  }, [hasNext, transactions]);

  const goPrev = useCallback(() => {
    setCursorIndex((i) => Math.max(i - 1, -1));
  }, []);

  const resetPagination = useCallback(() => {
    cursorStackRef.current = [];
    setCursorIndex(-1);
  }, []);

  const handleSetFilters = useCallback(
    (newFilters: TransactionFilters) => {
      setFilters(newFilters);
      resetPagination();
    },
    [resetPagination],
  );

  const addTransaction = useCallback(
    async (data: TransactionInput) => {
      if (!user) throw new Error("Not authenticated");
      return await addTransactionSvc(user.uid, data);
    },
    [user],
  );

  const updateTransaction = useCallback(
    async (id: string, data: TransactionUpdate) => {
      if (!user) throw new Error("Not authenticated");
      await updateTransactionSvc(user.uid, id, data);
    },
    [user],
  );

  const value: TransactionContextValue = {
    transactions,
    loading,
    filters,
    setFilters: handleSetFilters,
    balances,
    pagination: {
      hasNext,
      hasPrev,
      goNext,
      goPrev,
      pageSize,
      setPageSize: (size: number) => {
        setPageSize(size);
        resetPagination();
      },
      pageSizeOptions: PAGE_SIZE_OPTIONS,
    },
    addTransaction,
    updateTransaction,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};
