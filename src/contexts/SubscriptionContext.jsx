import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { subscribeToSubscriptions } from "@/services/subscriptionService";
import { subscribeToPayments } from "@/services/historyService";

const SubscriptionContext = createContext(null);

export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);
  if (!context)
    throw new Error(
      "useSubscriptions must be used within SubscriptionProvider",
    );
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubSubs = subscribeToSubscriptions(user.uid, (subs) => {
      setSubscriptions(subs);
      setLoading(false);
    });

    const unsubPayments = subscribeToPayments(user.uid, (pays) => {
      setPayments(pays);
    });

    return () => {
      unsubSubs();
      unsubPayments();
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
