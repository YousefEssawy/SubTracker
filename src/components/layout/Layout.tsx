import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useViewport } from "@/contexts/ViewportContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import BottomTabBar from "./BottomTabBar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isDesktop } = useViewport();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const handleMenuToggle = () => {
    if (isDesktop) {
      setSidebarCollapsed((prev) => !prev);
      return;
    }
    setMobileDrawerOpen((prev) => !prev);
  };

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      <Header onMenuToggle={handleMenuToggle} />

      <div className="flex flex-1 min-h-0">
        {/* Responsive Sidebar — collapsible on desktop, drawer on mobile */}
        <Sidebar
          isDrawerOpen={mobileDrawerOpen}
          isCollapsed={sidebarCollapsed}
          onClose={() => setMobileDrawerOpen(false)}
        />

        {/* Main Content — the only scrolling region; sidebar and header stay put */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="page-container pb-24 lg:pb-6">
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
      </div>

      <BottomTabBar />
    </div>
  );
};

export default Layout;
