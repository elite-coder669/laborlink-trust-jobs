import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext"; // Import useAuth
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import Workers from "./pages/Workers";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import EmployerDashboard from "./pages/EmployerDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import PostJob from "./pages/PostJob";
import JobDetail from "./pages/JobDetail";
import WorkerProfile from "./pages/WorkerProfile";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute"; // Ensure ProtectedRoute is imported

const queryClient = new QueryClient();

/**
 * This new component listens to auth state and handles all top-level redirects.
 * This fixes the race condition by ensuring navigation happens *after*
 * the auth context is updated.
 */
const AppRoutes = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return; // Wait for auth to initialize

    const authRoutes = ["/auth"];
    const onboardingRoute = "/onboarding";

    // 1. User is logged in
    if (user) {
      // 1a. User is logged in but has NO profile -> force onboarding
      if (!profile) {
        if (location.pathname !== onboardingRoute) {
          navigate(onboardingRoute);
        }
      }
      // 1b. User is logged in WITH profile but is on auth/onboarding page -> send to home
      else if (authRoutes.includes(location.pathname) || location.pathname === onboardingRoute) {
        navigate(profile.role === "employer" ? "/employer-dashboard" : "/");
      }
    }
    // 2. User is not logged in (handled by ProtectedRoute components)
  }, [user, profile, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/workers" element={<Workers />} />
      <Route path="/workers/:id" element={<WorkerProfile />} />
      <Route path="/about" element={<About />} />
      <Route
        path="/employer-dashboard"
        element={
          <ProtectedRoute requireRole="employer">
            <EmployerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker-dashboard"
        element={
          <ProtectedRoute requireRole="laborer">
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/post-job"
        element={
          <ProtectedRoute requireRole="employer">
            <PostJob />
          </ProtectedRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter> {/* <-- MOVED TO THE TOP */}
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes /> {/* <-- Use the new route handler */}
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;