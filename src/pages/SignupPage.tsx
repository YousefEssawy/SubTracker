import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpWithEmail, signInWithGoogle } from "@/services/authService";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import lightLogo from "@/assets/logo/light-mode.png";
import darkLogo from "@/assets/logo/dark-mode.png";
import { useTheme } from "@/contexts/ThemeContext";

const SignupPage = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPwd) {
      setError(t("signup.passwordsMismatch"));
      return;
    }
    if (password.length < 6) {
      setError(t("signup.passwordTooShort"));
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      navigate("/");
    } catch (err: any) {
      setError(
        err.message?.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "") ||
          t("signup.error"),
      );
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err: any) {
      setError(
        err.message?.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "") ||
          t("signup.error"),
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={theme === "light" ? lightLogo : darkLogo}
            alt="SubTracker"
            className="h-20 mx-auto mb-2"
          />
          <p className="text-gray-500 dark:text-gray-400">
            {t("signup.subtitle")}
          </p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t("signup.createAccount")}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 text-danger text-sm rounded-xl border border-danger/20">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 mb-6"
          >
            <FcGoogle className="w-5 h-5" />
            {t("signup.continueWithGoogle")}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-surface-dark text-gray-500">
                {t("signup.or")}
              </span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="label-text">{t("signup.fullName")}</label>
              <div className="relative">
                <HiOutlineUser className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="input-field ps-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label-text">{t("signup.email")}</label>
              <div className="relative">
                <HiOutlineEnvelope className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field ps-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label-text">{t("signup.password")}</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field ps-10 pe-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? (
                    <HiOutlineEyeSlash className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="label-text">
                {t("signup.confirmPassword")}
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="••••••••"
                  className="input-field ps-10"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loading
                ? t("signup.creatingAccount")
                : t("signup.createAccountBtn")}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {t("signup.hasAccount")}{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              {t("signup.signIn")}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
