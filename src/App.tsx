import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RequireMaster } from "@/components/guards/RequireMaster";
import { AuthProvider } from "@/providers/AuthProvider";
import { DashboardRouteLayout } from "@/layouts/DashboardRouteLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import ContentGenerator from "./pages/dashboard/ContentGenerator";
import BrandSettings from "./pages/dashboard/BrandSettings";
import MasterDashboard from "./pages/dashboard/MasterDashboard";
import ClientsPage from "./pages/dashboard/ClientsPage";
import CalendarPage from "./pages/dashboard/CalendarPage";
import CommentsPage from "./pages/dashboard/CommentsPage";
import ReportsPage from "./pages/dashboard/ReportsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/dashboard" element={<DashboardRouteLayout />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<Overview />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="content" element={<ContentGenerator />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="comments" element={<CommentsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<BrandSettings />} />
                <Route
                  path="master"
                  element={
                    <RequireMaster>
                      <MasterDashboard />
                    </RequireMaster>
                  }
                />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
