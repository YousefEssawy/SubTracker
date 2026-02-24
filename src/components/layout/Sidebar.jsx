import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineHome,
  HiOutlineCreditCard,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlinePlusCircle,
  HiOutlineInformationCircle,
  HiOutlineBookOpen,
  HiOutlineSparkles,
  HiOutlineXMark,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo/main-logo.png";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const navItems = [
    {
      path: "/dashboard",
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

  const NavLinks = ({ onClick }) =>
    navItems.map((item) => {
      const isActive = location.pathname === item.path;
      return (
        <Link
          key={item.path}
          to={item.path}
          onClick={onClick}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
            ${
              isActive
                ? "bg-primary/10 text-primary dark:text-primary-light"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
        >
          <item.icon
            className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary" : ""}`}
          />
          <span className="truncate">{item.label}</span>
        </Link>
      );
    });

  const AddButton = ({ onClick }) => (
    <div className="p-4 border-t border-gray-200 dark:border-gray-800">
      <Link
        to="/subscriptions/add"
        onClick={onClick}
        className="flex items-center justify-center gap-2 w-full btn-primary"
      >
        <HiOutlinePlusCircle className="w-5 h-5" />
        {t("sidebar.addSubscription", "Add Subscription")}
      </Link>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar — docked, always visible on lg+ */}
      <aside className="hidden lg:flex fixed start-0 top-16 bottom-0 w-64 flex-col bg-white dark:bg-surface-dark border-e border-gray-200 dark:border-gray-800 z-30">
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <NavLinks onClick={undefined} />
        </nav>
        <AddButton onClick={undefined} />
      </aside>

      {/* Mobile Sidebar — slide-out drawer overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: isRtl ? 288 : -288 }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? 288 : -288 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="lg:hidden fixed start-0 top-0 bottom-0 w-72 bg-white dark:bg-surface-dark flex flex-col z-50 shadow-2xl"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <img src={logo} alt="SubTracker" className="h-8" />
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close menu"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                <NavLinks onClick={onClose} />
              </nav>

              <AddButton onClick={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
