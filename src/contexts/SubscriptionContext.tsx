import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  subscribeToSubscriptions,
  updateSubscription,
} from "@/services/subscriptionService";
import { subscribeToPayments } from "@/services/historyService";
import { getNextRenewalDate, isPastDue } from "@/utils/dateUtils";
import { format, parseISO } from "date-fns";
import type { Subscription } from "@/models/subscription";
import type { Payment } from "@/models/payment";

interface SubscriptionContextValue {
  subscriptions: Subscription[];
  payments: Payment[];
  loading: boolean;
  activeSubscriptions: Subscription[];
  pausedSubscriptions: Subscription[];
  cancelledSubscriptions: Subscription[];
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null,
);

export const useSubscriptions = (): SubscriptionContextValue => {
  const context = useContext(SubscriptionContext);
  if (!context)
    throw new Error(
      "useSubscriptions must be used within SubscriptionProvider",
    );
  return context;
};

const advanceRenewalDate = (sub: Subscription): string | null => {
  if (!sub.renewalDate) return null;

  let nextDate =
    typeof sub.renewalDate === "string"
      ? parseISO(sub.renewalDate)
      : sub.renewalDate;

  let advanced = false;

  while (isPastDue(nextDate)) {
    nextDate = getNextRenewalDate(
      nextDate,
      sub.billingCycle,
      sub.customCycleDays,
    );
    advanced = true;
  }

  return advanced ? format(nextDate, "yyyy-MM-dd") : null;
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const renewalCheckedRef = useRef(new Set<string>());

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setPayments([]);
      setLoading(false);
      renewalCheckedRef.current.clear();
      return;
    }

    setLoading(true);
    const unsubSubs = subscribeToSubscriptions(user.uid, (subs) => {
      setSubscriptions(subs);
      setLoading(false);

      subs.forEach((sub) => {
        if (sub.status === "active" && !renewalCheckedRef.current.has(sub.id)) {
          renewalCheckedRef.current.add(sub.id);
          const newDate = advanceRenewalDate(sub);
          if (newDate) {
            void updateSubscription(user.uid, sub.id, { renewalDate: newDate });
          }
        }
      });
    });

    const unsubPayments = subscribeToPayments(user.uid, (pays) => {
      setPayments(pays);
    });

    return () => {
      unsubSubs();
      unsubPayments();
      renewalCheckedRef.current.clear();
    };
  }, [user]);

  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active",
  );
  const pausedSubscriptions = subscriptions.filter(
    (s) => s.status === "paused",
  );
  const cancelledSubscriptions = subscriptions.filter(
    (s) => s.status === "cancelled",
  );

  const value: SubscriptionContextValue = {
    subscriptions,
    payments,
    loading,
    activeSubscriptions,
    pausedSubscriptions,
    cancelledSubscriptions,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
