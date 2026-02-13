import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import {
  subscribeToSubscriptions,
  updateSubscription,
} from "@/services/subscriptionService";
import { subscribeToPayments } from "@/services/historyService";
import { getNextRenewalDate, isPastDue } from "@/utils/dateUtils";
import { format, parseISO } from "date-fns";

const SubscriptionContext = createContext(null);

export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);
  if (!context)
    throw new Error(
      "useSubscriptions must be used within SubscriptionProvider",
    );
  return context;
};

/**
 * Advance a subscription's renewal date forward until it's in the future.
 * Returns the new date string (yyyy-MM-dd) or null if no advancement was needed.
 */
const advanceRenewalDate = (sub) => {
  if (!sub.renewalDate) return null;

  let nextDate =
    typeof sub.renewalDate === "string"
      ? parseISO(sub.renewalDate)
      : sub.renewalDate;

  let advanced = false;

  // Keep advancing until the renewal date is today or in the future
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

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track which subscriptions have already been checked this session
  // to avoid infinite loops from onSnapshot re-firing after updates
  const renewalCheckedRef = useRef(new Set());

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

      // Auto-advance renewal dates for active subscriptions with past-due dates
      subs.forEach((sub) => {
        if (sub.status === "active" && !renewalCheckedRef.current.has(sub.id)) {
          renewalCheckedRef.current.add(sub.id);
          const newDate = advanceRenewalDate(sub);
          if (newDate) {
            updateSubscription(user.uid, sub.id, {
              renewalDate: newDate,
            });
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

  const value = {
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
