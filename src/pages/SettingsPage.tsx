import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getUserSettings, saveUserSettings } from "@/services/userService";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/utils/currencies";
import { HiOutlineSun, HiOutlineMoon, HiOutlineCheck } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import type { CurrencyCode } from "@/models";

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<{
    preferredCurrency: CurrencyCode;
    reminderDays: number;
  }>({
    preferredCurrency: DEFAULT_CURRENCY as CurrencyCode,
    reminderDays: 3,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const data = await getUserSettings(user.uid);
          if (data) {
            setSettings({
              preferredCurrency:
                (data.preferredCurrency as CurrencyCode) || DEFAULT_CURRENCY,
              reminderDays: data.reminderDays ?? 3,
            });
          }
        } catch (err) {
          console.error(err);
          toast.error(t("settings.loadError", "Failed to load settings."));
        }
        setLoading(false);
      })();
    }
  }, [user, t]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await saveUserSettings(user.uid, settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error(t("settings.saveError", "Failed to save settings."));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const sectionLabel =
    "text-xs font-semibold uppercase tracking-wide text-gray-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-5 pb-20 lg:pb-6"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-4 justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t("settings.title")}
        </h1>
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
        >
          {saved ? (
            <>
              <HiOutlineCheck className="w-4 h-4" /> {t("settings.saved")}
            </>
          ) : (
            t("settings.savePreferences")
          )}
        </button>
      </div>

      {/* Profile */}
      <div className="glass-card p-6">
        <p className={sectionLabel}>{t("settings.profile")}</p>
        <div className="mt-4 flex items-center gap-4">
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
        <p className={sectionLabel}>{t("settings.appearance")}</p>
        <div className="mt-4 inline-flex w-full rounded-full bg-gray-100 dark:bg-gray-800 p-1">
          <button
            onClick={() => theme !== "light" && toggleTheme()}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all
              ${theme === "light" ? "bg-white dark:bg-gray-900 text-primary shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
          >
            <HiOutlineSun className="w-5 h-5" />
            {t("settings.light")}
          </button>
          <button
            onClick={() => theme !== "dark" && toggleTheme()}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all
              ${theme === "dark" ? "bg-white dark:bg-gray-900 text-primary shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
          >
            <HiOutlineMoon className="w-5 h-5" />
            {t("settings.dark")}
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass-card p-6 space-y-5">
        <p className={sectionLabel}>{t("settings.preferences")}</p>
        <div>
          <label className="label-text">{t("settings.displayCurrency")}</label>
          <select
            value={settings.preferredCurrency}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                preferredCurrency: e.target.value as CurrencyCode,
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
          <label className="label-text">{t("settings.reminderDays")}</label>
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
            <option value={1}>{t("settings.dayBefore", { count: 1 })}</option>
            <option value={3}>{t("settings.daysBefore", { count: 3 })}</option>
            <option value={7}>{t("settings.daysBefore", { count: 7 })}</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
