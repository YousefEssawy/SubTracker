import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import {
  addTransaction as addTransactionSvc,
  updateTransaction as updateTransactionSvc,
  subscribeToTransactions,
  subscribeToAllTransactions,
} from "@/services/transactionService";
import { computeBalances } from "@/utils/balanceUtils";

const TransactionContext = createContext(null);

export const useTransactions = () => {
  const ctx = useContext(TransactionContext);
  if (!ctx)
    throw new Error("useTransactions must be used within TransactionProvider");
  return ctx;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const DEFAULT_PAGE_SIZE = 10;

export const TransactionProvider = ({ children }) => {
  const { user } = useAuth();

  // ── Filter state ───────────────────────────────────────────────────
  const [filters, setFilters] = useState({});

  // ── Paginated list state ───────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Cursor stack for back-navigation: array of startAfterDoc snapshots
  const cursorStackRef = useRef([]); // each entry = last doc of that page
  const [cursorIndex, setCursorIndex] = useState(-1); // -1 = first page
  const [hasNext, setHasNext] = useState(false);

  // ── Balance state (all transactions, unfiltered by page) ───────────
  const [allTransactions, setAllTransactions] = useState([]);

  // ── Subscriptions ──────────────────────────────────────────────────
  // Paginated subscription
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
      { ...filters, pageSize: pageSize + 1, startAfterDoc: cursor },
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

  // All-transactions subscription for balance computation
  useEffect(() => {
    if (!user) {
      setAllTransactions([]);
      return;
    }
    const balanceFilters = {
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

  // ── Pagination helpers ─────────────────────────────────────────────
  const hasPrev = cursorIndex >= 0;

  const goNext = useCallback(() => {
    if (!hasNext || transactions.length === 0) return;
    // Store the last document of the current page as the next cursor
    // We rely on the raw snapshot being available from the service
    // For simplicity we encode the last transactionDate + id as a virtual cursor
    // The service handles this via its internal lastDocRef
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
    (newFilters) => {
      setFilters(newFilters);
      resetPagination();
    },
    [resetPagination],
  );

  // ── CRUD ───────────────────────────────────────────────────────────
  const addTransaction = useCallback(
    async (data) => {
      if (!user) throw new Error("Not authenticated");
      await addTransactionSvc(user.uid, data);
    },
    [user],
  );

  const updateTransaction = useCallback(
    async (id, data) => {
      if (!user) throw new Error("Not authenticated");
      await updateTransactionSvc(user.uid, id, data);
    },
    [user],
  );

  return (
    <TransactionContext.Provider
      value={{
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
          setPageSize: (size) => {
            setPageSize(size);
            resetPagination();
          },
          pageSizeOptions: PAGE_SIZE_OPTIONS,
        },
        addTransaction,
        updateTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
