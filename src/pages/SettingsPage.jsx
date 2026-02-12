import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/utils/currencies";
import { HiOutlineSun, HiOutlineMoon, HiOutlineCheck } from "react-icons/hi2";

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    preferredCurrency: DEFAULT_CURRENCY,
    reminderDays: 3,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      (async () => {
        const profileRef = doc(db, "users", user.uid);
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          const data = snap.data();
          setSettings({
            preferredCurrency: data.preferredCurrency || DEFAULT_CURRENCY,
            reminderDays: data.reminderDays ?? 3,
          });
        }
        setLoading(false);
      })();
    }
  }, [user]);

  const handleSave = async () => {
    const profileRef = doc(db, "users", user.uid);
    await setDoc(profileRef, settings, { merge: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6 pb-20 lg:pb-6"
    >
      <h1 className="page-title">Settings</h1>

      {/* Profile */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
          Profile
        </h2>
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-16 h-16 rounded-2xl" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
              {(user?.displayName || user?.email || "?")[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {user?.displayName || "User"}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
          Appearance
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => theme !== "light" && toggleTheme()}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all
              ${theme === "light" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 dark:border-gray-700 text-gray-500"}`}
          >
            <HiOutlineSun className="w-5 h-5" />
            Light
          </button>
          <button
            onClick={() => theme !== "dark" && toggleTheme()}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all
              ${theme === "dark" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 dark:border-gray-700 text-gray-500"}`}
          >
            <HiOutlineMoon className="w-5 h-5" />
            Dark
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
          Preferences
        </h2>
        <div>
          <label className="label-text">Display Currency</label>
          <select
            value={settings.preferredCurrency}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                preferredCurrency: e.target.value,
              }))
            }
            className="select-field"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-text">Reminder Days Before Renewal</label>
          <select
            value={settings.reminderDays}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                reminderDays: parseInt(e.target.value),
              }))
            }
            className="select-field"
          >
            <option value={1}>1 day before</option>
            <option value={3}>3 days before</option>
            <option value={7}>7 days before</option>
          </select>
        </div>
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
        >
          {saved ? (
            <>
              <HiOutlineCheck className="w-4 h-4" /> Saved!
            </>
          ) : (
            "Save Preferences"
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
