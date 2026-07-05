import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineHome,
  HiOutlineCreditCard,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlinePlusCircle,
  HiOutlineInformationCircle,
  HiOutlineBookOpen,
  HiOutlineXMark,
  HiOutlineRectangleGroup,
  HiOutlineTag,
  HiOutlineBanknotes,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import type { IconType } from "react-icons";
import logo from "@/assets/logo/main-logo.png";

// ─── Nav items defined outside the component to avoid re-creation on render ──
interface NavItem {
  path: string;
  label: string;
  icon: IconType;
}

const makeNavItems = (t: TFunction): Record<string, NavItem[]> => ({
  overview: [
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
  ],
  finance: [
    {
      path: "/transactions",
      label: t("sidebar.transactions", "Transactions"),
      icon: HiOutlineBanknotes,
    },
    {
      path: "/spaces",
      label: t("sidebar.spaces", "Spaces"),
      icon: HiOutlineRectangleGroup,
    },
    {
      path: "/categories",
      label: t("sidebar.categories", "Categories"),
      icon: HiOutlineTag,
    },
    {
      path: "/recurrences",
      label: t("sidebar.recurrences", "Recurrences"),
      icon: HiOutlineArrowPath,
    },
  ],
  preferences: [
    {
      path: "/settings",
      label: t("sidebar.settings", "Settings"),
      icon: HiOutlineCog6Tooth,
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
  ],
});

// ─── Individual nav link ──────────────────────────────────────────────────────
const NavLink = ({
  item,
  onClick,
  isActive,
}: {
  item: NavItem;
  onClick?: () => void;
  isActive: boolean;
}) => (
  <Link
    to={item.path}
    onClick={onClick}
    className={`nav-link ${isActive ? "nav-link-active" : ""}`}
  >
    <item.icon className="w-5 h-5 flex-shrink-0" />
    <span className="truncate">{item.label}</span>
  </Link>
);

// ─── Section of nav links ─────────────────────────────────────────────────────
const NavSection = ({
  title,
  items,
  onClick,
  pathname,
}: {
  title?: string;
  items: NavItem[];
  onClick?: () => void;
  pathname: string;
}) => (
  <div className="mb-2">
    {title && <p className="nav-section-label">{title}</p>}
    {items.map((item) => (
      <NavLink
        key={item.path}
        item={item}
        onClick={onClick}
        isActive={
          pathname === item.path ||
          (item.path !== "/dashboard" && pathname.startsWith(item.path))
        }
      />
    ))}
  </div>
);

// ─── Add Subscription button ──────────────────────────────────────────────────
const AddButton = ({
  onClick,
  label,
}: {
  onClick?: () => void;
  label: string;
}) => (
  <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
    <Link
      to="/subscriptions/add"
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full btn-primary"
    >
      <HiOutlinePlusCircle className="w-5 h-5" />
      {label}
    </Link>
  </div>
);

// ─── Nav content (overview + finance + preferences sections) ──────────────────
const NavContent = ({
  navItems,
  sectionLabels,
  pathname,
  onClick,
}: {
  navItems: Record<string, NavItem[]>;
  sectionLabels: Record<string, string>;
  pathname: string;
  onClick?: () => void;
}) => (
  <>
    <NavSection
      title={sectionLabels.overview}
      items={navItems.overview!}
      onClick={onClick}
      pathname={pathname}
    />
    <NavSection
      title={sectionLabels.finance}
      items={navItems.finance!}
      onClick={onClick}
      pathname={pathname}
    />
    <NavSection
      title={sectionLabels.preferences}
      items={navItems.preferences!}
      onClick={onClick}
      pathname={pathname}
    />
  </>
);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Sidebar component ────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const navItems = makeNavItems(t);
  const addLabel = t("sidebar.addSubscription", "Add Subscription");
  const sectionLabels = {
    overview: t("sidebar.overview", "Overview"),
    finance: t("sidebar.finance", "Finance"),
    preferences: t("sidebar.preferences", "Preferences"),
  };

  return (
    <>
      {/* Desktop Sidebar — floating glass panel, collapsible via isOpen */}
      <aside
        className={`hidden lg:flex fixed start-3 top-20 bottom-3 w-64 flex-col glass-card z-30 overflow-hidden transition-transform duration-300 ease-standard ${
          isOpen
            ? "translate-x-0"
            : "ltr:-translate-x-[calc(100%+0.75rem)] rtl:translate-x-[calc(100%+0.75rem)]"
        }`}
      >
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <NavContent
            navItems={navItems}
            sectionLabels={sectionLabels}
            pathname={location.pathname}
            onClick={undefined}
          />
        </nav>
        <AddButton onClick={undefined} label={addLabel} />
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
              className="lg:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: isRtl ? 288 : -288 }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? 288 : -288 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="lg:hidden fixed start-3 top-3 bottom-3 w-72 glass-card flex flex-col z-50"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-800/50">
                <img src={logo} alt="SubTracker" className="h-8" />
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100/70 dark:hover:bg-gray-800/70 transition-colors"
                  aria-label="Close menu"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 px-3 overflow-y-auto">
                <NavContent
                  navItems={navItems}
                  sectionLabels={sectionLabels}
                  pathname={location.pathname}
                  onClick={onClose}
                />
              </nav>

              <AddButton onClick={onClose} label={addLabel} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
