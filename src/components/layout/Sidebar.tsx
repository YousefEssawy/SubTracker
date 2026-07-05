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
  ],
  money: [
    {
      path: "/transactions",
      label: t("sidebar.transactions", "Transactions"),
      icon: HiOutlineBanknotes,
    },
    {
      path: "/subscriptions",
      label: t("sidebar.subscriptions", "Subscriptions"),
      icon: HiOutlineCreditCard,
    },
    {
      path: "/recurrences",
      label: t("sidebar.recurrences", "Recurrences"),
      icon: HiOutlineArrowPath,
    },
  ],
  organize: [
    {
      path: "/categories",
      label: t("sidebar.categories", "Categories"),
      icon: HiOutlineTag,
    },
    {
      path: "/spaces",
      label: t("sidebar.spaces", "Spaces"),
      icon: HiOutlineRectangleGroup,
    },
  ],
  activity: [
    {
      path: "/history",
      label: t("sidebar.history", "History"),
      icon: HiOutlineClock,
    },
  ],
  account: [
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
  collapsed,
}: {
  item: NavItem;
  onClick?: () => void;
  isActive: boolean;
  collapsed?: boolean;
}) => (
  <Link
    to={item.path}
    onClick={onClick}
    className={`nav-link ${isActive ? "nav-link-active" : ""} ${collapsed ? "justify-center px-2" : ""}`}
    title={collapsed ? item.label : undefined}
  >
    <item.icon className="w-5 h-5 flex-shrink-0" />
    {!collapsed && <span className="truncate">{item.label}</span>}
  </Link>
);

// ─── Section of nav links ─────────────────────────────────────────────────────
const NavSection = ({
  title,
  items,
  onClick,
  pathname,
  collapsed,
}: {
  title?: string;
  items: NavItem[];
  onClick?: () => void;
  pathname: string;
  collapsed?: boolean;
}) => (
  <div className="mb-2">
    {title && !collapsed && <p className="nav-section-label">{title}</p>}
    {items.map((item) => (
      <NavLink
        key={item.path}
        item={item}
        onClick={onClick}
        collapsed={collapsed}
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
  collapsed,
}: {
  onClick?: () => void;
  label: string;
  collapsed?: boolean;
}) => (
  <div
    className={`border-t border-gray-200/50 dark:border-gray-800/50 ${collapsed ? "p-3 flex justify-center" : "p-4"}`}
  >
    <Link
      to="/subscriptions/add"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={
        collapsed
          ? "gradient-primary flex items-center justify-center w-11 h-11 rounded-full text-white transition-all duration-200 active:scale-[0.98]"
          : "flex items-center justify-center gap-2 w-full btn-primary"
      }
      style={collapsed ? { boxShadow: "var(--shadow-glow-primary)" } : undefined}
    >
      <HiOutlinePlusCircle className="w-5 h-5 flex-shrink-0" />
      {!collapsed && label}
    </Link>
  </div>
);

// ─── Nav content (overview + finance + preferences sections) ──────────────────
const SECTION_ORDER = ["overview", "money", "organize", "activity", "account"];

const NavContent = ({
  navItems,
  sectionLabels,
  pathname,
  onClick,
  collapsed,
}: {
  navItems: Record<string, NavItem[]>;
  sectionLabels: Record<string, string>;
  pathname: string;
  onClick?: () => void;
  collapsed?: boolean;
}) => (
  <>
    {SECTION_ORDER.map((key) => (
      <NavSection
        key={key}
        title={sectionLabels[key]}
        items={navItems[key]!}
        onClick={onClick}
        pathname={pathname}
        collapsed={collapsed}
      />
    ))}
  </>
);

interface SidebarProps {
  isDrawerOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

// ─── Sidebar component ────────────────────────────────────────────────────────
const Sidebar = ({ isDrawerOpen, isCollapsed, onClose }: SidebarProps) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const navItems = makeNavItems(t);
  const addLabel = t("sidebar.addSubscription", "Add Subscription");
  const sectionLabels = {
    overview: t("sidebar.overview", "Overview"),
    money: t("sidebar.money", "Money"),
    organize: t("sidebar.organize", "Organize"),
    activity: t("sidebar.activity", "Activity"),
    account: t("sidebar.account", "Account"),
  };

  return (
    <>
      {/* Desktop Sidebar — flush, docked under the header, full height of its row */}
      <aside
        className={`hidden lg:flex h-full shrink-0 flex-col bg-white dark:bg-surface-dark border-e border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ease-standard ${
          isCollapsed ? "w-[72px]" : "w-[248px]"
        }`}
      >
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <NavContent
            navItems={navItems}
            sectionLabels={sectionLabels}
            pathname={location.pathname}
            collapsed={isCollapsed}
            onClick={undefined}
          />
        </nav>
        <AddButton onClick={undefined} label={addLabel} collapsed={isCollapsed} />
      </aside>

      {/* Mobile Sidebar — slide-out drawer overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
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
                  collapsed={false}
                  onClick={onClose}
                />
              </nav>

              <AddButton onClick={onClose} label={addLabel} collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
