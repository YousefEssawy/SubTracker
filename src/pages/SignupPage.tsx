import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpWithEmail, signInWithGoogle } from "@/services/authService";
import { FcGoogle } from "react-icons/fc";
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import AuthShell from "@/components/layout/AuthShell";
import { useTranslation } from "react-i18next";
import { formatAuthErrorMessage } from "@/utils/errors";

const SignupPage = () => {
  const { t } = useTranslation();
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
    } catch (err) {
      setError(formatAuthErrorMessage(err) || t("signup.error"));
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err) {
      setError(formatAuthErrorMessage(err) || t("signup.error"));
    }
    setLoading(false);
  };

  return (
    <AuthShell
      variant="signup"
      title={t("signup.createAccount")}
      subtitle={t("signup.subtitle")}
    >
      {error && (
        <div className="mb-4 p-3 bg-danger/10 text-danger text-sm rounded-xl border border-danger/20">
          {error}
        </div>
      )}

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
          <p className="mt-1.5 text-xs text-gray-400">
            {t("signup.passwordHint", "Must be at least 6 characters.")}
          </p>
        </div>
        <div>
          <label className="label-text">{t("signup.confirmPassword")}</label>
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
          {loading ? t("signup.creatingAccount") : t("signup.createAccountBtn")}
        </button>
      </form>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="mt-3 w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <FcGoogle className="w-5 h-5" />
        {t("signup.continueWithGoogle")}
      </button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        {t("signup.hasAccount")}{" "}
        <Link to="/login" className="text-primary hover:underline font-medium">
          {t("signup.signIn")}
        </Link>
      </p>
    </AuthShell>
  );
};

export default SignupPage;
