import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Desktop starts with the sidebar open; mobile starts closed (drawer).
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : true,
  );
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark overflow-x-hidden">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Responsive Sidebar — collapsible on desktop, drawer on mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main
        className={`pt-24 min-h-screen transition-[margin] duration-300 ease-standard ${
          sidebarOpen ? "lg:ms-[280px]" : "lg:ms-0"
        }`}
      >
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
    </div>
  );
};

export default Layout;
