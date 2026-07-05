import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark overflow-x-hidden">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="lg:ms-[280px] pt-24 min-h-screen">
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
