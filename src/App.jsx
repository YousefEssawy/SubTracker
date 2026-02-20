import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import Layout from "@/components/layout/Layout";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import DashboardPage from "@/pages/DashboardPage";
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import SubscriptionFormPage from "@/pages/SubscriptionFormPage";
import HistoryPage from "@/pages/HistoryPage";
import SettingsPage from "@/pages/SettingsPage";
import AboutPage from "@/pages/AboutPage";
import HowToPage from "@/pages/HowToPage";
import ComingSoonPage from "@/pages/ComingSoonPage";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" /> : children;
};

const App = () => {
  return (
    <ThemeProvider>
      <Router basename="/SubTracker">
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />

            {/* Layout Routes (Public & Protected mixed) */}
            <Route
              path="/*"
              element={
                <SubscriptionProvider>
                  <Layout>
                    <Routes>
                      {/* Protected Routes */}
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <DashboardPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/subscriptions"
                        element={
                          <ProtectedRoute>
                            <SubscriptionsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/subscriptions/add"
                        element={
                          <ProtectedRoute>
                            <SubscriptionFormPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/subscriptions/:id"
                        element={
                          <ProtectedRoute>
                            <SubscriptionFormPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/history"
                        element={
                          <ProtectedRoute>
                            <HistoryPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute>
                            <SettingsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Public Layout Routes */}
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/how-to" element={<HowToPage />} />
                      <Route path="/coming-soon" element={<ComingSoonPage />} />
                    </Routes>
                  </Layout>
                </SubscriptionProvider>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
