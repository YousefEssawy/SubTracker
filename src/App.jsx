import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { SpaceProvider } from "@/contexts/SpaceContext";
import { CategoryProvider } from "@/contexts/CategoryContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { RecurrenceProvider } from "@/contexts/RecurrenceContext";
import Layout from "@/components/layout/Layout";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/DashboardPage";
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import SubscriptionFormPage from "@/pages/SubscriptionFormPage";
import HistoryPage from "@/pages/HistoryPage";
import SettingsPage from "@/pages/SettingsPage";
import AboutPage from "@/pages/AboutPage";
import HowToPage from "@/pages/HowToPage";
import ComingSoonPage from "@/pages/ComingSoonPage";
import SpacesPage from "@/pages/SpacesPage";
import CategoriesPage from "@/pages/CategoriesPage";
import TransactionsPage from "@/pages/TransactionsPage";
import TransactionFormPage from "@/pages/TransactionFormPage";
import TransactionDetailPage from "@/pages/TransactionDetailPage";
import RecurrencesPage from "@/pages/RecurrencesPage";

// Redirect authenticated users away from auth-only pages (login/signup)
const PublicAuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// Redirect unauthenticated users away from protected pages
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
  return user ? children : <Navigate to="/login" replace />;
};

// Public landing root: authenticated users go to dashboard, unauthenticated see LandingPage
const RootRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

const App = () => {
  return (
    <ThemeProvider>
      <Router basename="/SubTracker">
        <AuthProvider>
          <Routes>
            {/* Public root – landing page for guests, redirect to dashboard for users */}
            <Route path="/" element={<RootRoute />} />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicAuthRoute>
                  <LoginPage />
                </PublicAuthRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicAuthRoute>
                  <SignupPage />
                </PublicAuthRoute>
              }
            />

            {/* App shell with sidebar layout */}
            <Route
              path="/*"
              element={
                <SubscriptionProvider>
                  <SpaceProvider>
                    <CategoryProvider>
                      <TransactionProvider>
                        <RecurrenceProvider>
                          <Layout>
                            <Routes>
                              {/* Dashboard */}
                              <Route
                                path="/dashboard"
                                element={
                                  <ProtectedRoute>
                                    <DashboardPage />
                                  </ProtectedRoute>
                                }
                              />

                              {/* Subscriptions */}
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

                              {/* ── Finance Routes ── */}
                              <Route
                                path="/spaces"
                                element={
                                  <ProtectedRoute>
                                    <SpacesPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/categories"
                                element={
                                  <ProtectedRoute>
                                    <CategoriesPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/transactions"
                                element={
                                  <ProtectedRoute>
                                    <TransactionsPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/transactions/add"
                                element={
                                  <ProtectedRoute>
                                    <TransactionFormPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/transactions/:id/edit"
                                element={
                                  <ProtectedRoute>
                                    <TransactionFormPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/transactions/:id"
                                element={
                                  <ProtectedRoute>
                                    <TransactionDetailPage />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/recurrences"
                                element={
                                  <ProtectedRoute>
                                    <RecurrencesPage />
                                  </ProtectedRoute>
                                }
                              />

                              {/* Public Layout Routes */}
                              <Route path="/about" element={<AboutPage />} />
                              <Route path="/how-to" element={<HowToPage />} />
                              <Route
                                path="/coming-soon"
                                element={<ComingSoonPage />}
                              />
                            </Routes>
                          </Layout>
                        </RecurrenceProvider>
                      </TransactionProvider>
                    </CategoryProvider>
                  </SpaceProvider>
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
