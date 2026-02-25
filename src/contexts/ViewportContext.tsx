import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface ViewportContextValue {
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const ViewportContext = createContext<ViewportContextValue | null>(null);

export const ViewportProvider = ({ children }: { children: ReactNode }) => {
  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return (
    <ViewportContext.Provider value={{ width, isMobile, isTablet, isDesktop }}>
      {children}
    </ViewportContext.Provider>
  );
};

export const useViewport = (): ViewportContextValue => {
  const context = useContext(ViewportContext);
  if (!context) {
    throw new Error("useViewport must be used within a ViewportProvider");
  }
  return context;
};
