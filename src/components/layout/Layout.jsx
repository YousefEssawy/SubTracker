import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineHome,
  HiOutlineCreditCard,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlinePlusCircle,
  HiOutlineInformationCircle,
  HiOutlineBookOpen,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import Header from "./Header";
import logo from "@/assets/logo/main-logo.png";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const navItems = [
    {
      path: "/",
      label: t("sidebar.dashboard", "Dashboard"),
      icon: HiOutlineHome,
    },
    {
      path: "/subscriptions",
      label: t("sidebar.subscriptions", "Subscriptions"),
      icon: HiOutlineCreditCard,
    },
    {
      path: "/history",
      label: t("sidebar.history", "History"),
      icon: HiOutlineClock,
    },
    {
      path: "/settings",
      label: t("sidebar.settings", "Settings"),
      icon: HiOutlineCog6Tooth,
    },
    {
      path: "/coming-soon",
      label: t("sidebar.comingSoon", "Coming Soon"),
      icon: HiOutlineSparkles,
    },
    {
      path: "/how-to",
      label: t("sidebar.howToUse", "How to Use"),
      icon: HiOutlineBookOpen,
    },
    {
      path: "/about",
      label: t("sidebar.about", "About"),
      icon: HiOutlineInformationCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed start-0 top-16 bottom-0 w-64 flex-col bg-white dark:bg-surface-dark border-e border-gray-200 dark:border-gray-800 z-30">
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary/10 text-primary dark:text-primary-light"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-primary" : ""}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            to="/subscriptions/add"
            className="flex items-center justify-center gap-2 w-full btn-primary"
          >
            <HiOutlinePlusCircle className="w-5 h-5" />
            {t("sidebar.addSubscription", "Add Subscription")}
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: isRtl ? 280 : -280 }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? 280 : -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed start-0 top-0 bottom-0 w-72 bg-white dark:bg-surface-dark flex flex-col z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <img src={logo} alt="SubTracker" className="h-8" />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                        ${
                          isActive
                            ? "bg-primary/10 text-primary dark:text-primary-light"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                    >
                      <item.icon
                        className={`w-5 h-5 ${isActive ? "text-primary" : ""}`}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <Link
                  to="/subscriptions/add"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-center gap-2 w-full btn-primary"
                >
                  <HiOutlinePlusCircle className="w-5 h-5" />
                  {t("sidebar.addSubscription", "Add Subscription")}
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ms-64 pt-16 min-h-screen">
        <div className="page-container">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 z-30 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors
                  ${
                    isActive
                      ? "text-primary dark:text-primary-light"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
