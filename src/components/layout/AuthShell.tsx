import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import lightLogo from "@/assets/logo/light-mode.png";
import darkLogo from "@/assets/logo/dark-mode.png";

interface AuthShellProps {
  variant: "login" | "signup";
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

// Inline white wordmark for the gradient brand panel
const BrandMark = () => (
  <Link to="/" className="inline-flex items-center gap-2.5">
    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm text-white font-display font-bold">
      S
    </span>
    <span className="font-display text-lg font-bold text-white">
      SubTracker
    </span>
  </Link>
);

const AuthShell = ({ variant, title, subtitle, children }: AuthShellProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const bullets = [
    t("signup.brand.bullet1", "See your true monthly burn rate"),
    t("signup.brand.bullet2", "Never miss a renewal again"),
    t("signup.brand.bullet3", "Income vs expense at a glance"),
  ];

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
      {/* Brand panel */}
      <div className="hidden lg:flex w-[44%] max-w-[560px] gradient-primary relative flex-col justify-between p-12 overflow-hidden">
        {/* soft light blooms */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.18),transparent_40%),radial-gradient(circle_at_10%_90%,rgba(255,255,255,0.12),transparent_35%)]" />

        <div className="relative">
          <BrandMark />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <h2 className="font-display text-[34px] leading-tight font-bold text-white">
            {variant === "login"
              ? t(
                  "login.brand.headline",
                  "Calm, clear control over every dollar that leaves your account.",
                )
              : t(
                  "signup.brand.headline",
                  "Start tracking in minutes. Feel in control by tonight.",
                )}
          </h2>

          {variant === "login" ? (
            <p className="mt-4 text-white/80 leading-relaxed max-w-sm">
              {t(
                "login.brand.sub",
                "Join thousands tracking subscriptions and expenses without the spreadsheet stress.",
              )}
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-3 text-white/90 text-sm"
                >
                  <HiOutlineCheckCircle className="w-5 h-5 flex-shrink-0 text-white" />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        <div className="relative">
          {variant === "login" ? (
            <div className="flex items-center gap-10">
              <div>
                <p className="figure text-2xl font-bold text-white">$248</p>
                <p className="text-xs text-white/70">
                  {t("login.brand.stat1", "avg monthly spend")}
                </p>
              </div>
              <div>
                <p className="figure text-2xl font-bold text-white">6 days</p>
                <p className="text-xs text-white/70">
                  {t("login.brand.stat2", "to next renewal")}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/70">
              {t("signup.brand.noCard", "No credit card required.")}
            </p>
          )}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo (brand panel hidden on small screens) */}
          <img
            src={theme === "light" ? lightLogo : darkLogo}
            alt="SubTracker"
            className="h-12 mb-8 lg:hidden"
          />

          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-1.5 text-gray-500 dark:text-gray-400">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthShell;
