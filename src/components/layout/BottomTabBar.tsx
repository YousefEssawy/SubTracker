import { Link, useLocation } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineCreditCard,
  HiOutlineBanknotes,
  HiOutlineRectangleGroup,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";

const BottomTabBar = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const tabs = [
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
      path: "/settings",
      label: t("sidebar.settings", "Settings"),
      icon: HiOutlineCog6Tooth,
    },
  ];

  return (
    <nav className="mobile-tabbar" aria-label="Primary mobile navigation">
      <div className="flex items-stretch gap-1">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.path ||
            (tab.path !== "/dashboard" && pathname.startsWith(tab.path));

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`mobile-tab-item ${isActive ? "mobile-tab-item-active" : ""}`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="truncate max-w-full">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
