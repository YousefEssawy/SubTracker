import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSubscriptions } from "@/contexts/SubscriptionContext";
import { logOut } from "@/services/authService";
import { isRenewingSoon } from "@/utils/dateUtils";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineBars3,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineBell,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import lightLogo from "@/assets/logo/light-mode.png";
import darkLogo from "@/assets/logo/dark-mode.png";

const Header = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { activeSubscriptions } = useSubscriptions();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const upcomingRenewals = activeSubscriptions.filter((s) =>
    isRenewingSoon(s.renewalDate, 7),
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 z-40">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {/* <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <HiOutlineBars3 className="w-5 h-5" />
          </button> */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={theme === "light" ? lightLogo : darkLogo}
              alt="SubTracker"
              className="h-20"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() =>
              i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")
            }
            className="px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300"
            title="Toggle Language"
          >
            {i18n.language === "ar" ? "EN" : "عربي"}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <HiOutlineMoon className="w-5 h-5 text-gray-600" />
            ) : (
              <HiOutlineSun className="w-5 h-5 text-yellow-400" />
            )}
          </button>

          {!user ? (
            <Link
              to="/login"
              className="ml-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors"
            >
              {t("header.signIn", "Sign In")}
            </Link>
          ) : (
            <>
              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setShowNotif(!showNotif)}
                  className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <HiOutlineBell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  {upcomingRenewals.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full animate-pulse" />
                  )}
                </button>
                {showNotif && (
                  <div className="absolute end-0 top-12 w-80 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale-in">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <h3 className="font-semibold text-sm">
                        {t("header.upcomingRenewals", "Upcoming Renewals")}
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {upcomingRenewals.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-6">
                          {t("header.noRenewals", "No upcoming renewals 🎉")}
                        </p>
                      ) : (
                        upcomingRenewals.map((sub) => (
                          <div
                            key={sub.id}
                            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {sub.name}
                              </span>
                              <span className="text-xs text-warning font-medium">
                                {(() => {
                                  const days = Math.ceil(
                                    (new Date(sub.renewalDate) - new Date()) /
                                      (1000 * 60 * 60 * 24),
                                  );
                                  return days <= 0
                                    ? t("header.today", "Today!")
                                    : t("header.inDays", "in {{count}} day", {
                                        count: days,
                                      });
                                })()}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {sub.currency} {sub.price}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                      {(user?.displayName ||
                        user?.email ||
                        "?")[0].toUpperCase()}
                    </div>
                  )}
                </button>
                {showProfile && (
                  <div className="absolute end-0 top-12 w-56 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale-in">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <p className="font-semibold text-sm truncate">
                        {user?.displayName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                      {t("header.signOut", "Sign Out")}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
