import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Landing
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth Pages
import CustomerLogin from "./pages/auth/CustomerLogin";
import AdminLogin from "./pages/auth/AdminLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Register from "./pages/auth/Register";

// Customer Pages
import CustomerDashboard from "./pages/customer/Dashboard";
import TransactionHistory from "./pages/customer/TransactionHistory";
import SendMoney from "./pages/customer/SendMoney";
import CardsPage from "./pages/customer/Cards";
import ProfilePage from "./pages/customer/Profile";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import CustomerManagement from "./pages/admin/CustomerManagement";
import CustomerDetail from "./pages/admin/CustomerDetail";
import CardRequests from "./pages/admin/CardRequests";
import ActivityLog from "./pages/admin/ActivityLog";
import PendingTransfers from "./pages/admin/PendingTransfers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<Index />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword variant="customer" />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword variant="admin" />} />
            
            {/* Customer Routes (Protected) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute>
                <TransactionHistory />
              </ProtectedRoute>
            } />
            <Route path="/send-money" element={
              <ProtectedRoute>
                <SendMoney />
              </ProtectedRoute>
            } />
            <Route path="/cards" element={
              <ProtectedRoute>
                <CardsPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes (Protected) */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/customers" element={
              <ProtectedRoute requireAdmin>
                <CustomerManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/customers/:customerId" element={
              <ProtectedRoute requireAdmin>
                <CustomerDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/transfers" element={
              <ProtectedRoute requireAdmin>
                <PendingTransfers />
              </ProtectedRoute>
            } />
            <Route path="/admin/requests" element={
              <ProtectedRoute requireAdmin>
                <CardRequests />
              </ProtectedRoute>
            } />
            <Route path="/admin/activity" element={
              <ProtectedRoute requireAdmin>
                <ActivityLog />
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
