import { createContext, useContext, useState, useEffect } from "react";

const ViewportContext = createContext(null);

export const ViewportProvider = ({ children }) => {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    // Initial call just in case
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = width < 768; // Tailwind md is 768px
  const isTablet = width >= 768 && width < 1024; // Tailwind lg is 1024px
  const isDesktop = width >= 1024;

  return (
    <ViewportContext.Provider value={{ width, isMobile, isTablet, isDesktop }}>
      {children}
    </ViewportContext.Provider>
  );
};

export const useViewport = () => {
  const context = useContext(ViewportContext);
  if (!context) {
    throw new Error("useViewport must be used within a ViewportProvider");
  }
  return context;
};
