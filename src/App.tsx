import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// We'll be creating these pages in the next steps
// This is just the routing structure for now

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div>Admin Dashboard - Coming in next phase</div>
              </ProtectedRoute>
            } />
            <Route path="/admin/manage-users" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div>Manage Users - Coming in next phase</div>
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div>Reports - Coming in next phase</div>
              </ProtectedRoute>
            } />
            <Route path="/admin/system-settings" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div>System Settings - Coming in next phase</div>
              </ProtectedRoute>
            } />
            <Route path="/admin/send-notification" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div>Send Notification - Coming in next phase</div>
              </ProtectedRoute>
            } />
            
            {/* Staff routes */}
            <Route path="/staff/dashboard" element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <div>Staff Dashboard - Coming in next phase</div>
              </ProtectedRoute>
            } />
            <Route path="/staff/manage-flights" element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <div>Manage Flights - Coming in next phase</div>
              </ProtectedRoute>
            } />
            <Route path="/staff/assign-gate-runway" element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <div>Assign Gate/Runway - Coming in next phase</div>
              </ProtectedRoute>
            } />
            <Route path="/staff/real-time-flights" element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <div>Real-Time Flights - Coming in next phase</div>
              </ProtectedRoute>
            } />
            <Route path="/staff/send-notification" element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <div>Send Notification - Coming in next phase</div>
              </ProtectedRoute>
            } />
            
            {/* Airline routes */}
            <Route path="/airline/dashboard" element={
              <ProtectedRoute allowedRoles={["airline"]}>
                <div>Airline Dashboard - Coming in next phase</div>
              </ProtectedRoute>
            } />
            <Route path="/airline/my-flights" element={
              <ProtectedRoute allowedRoles={["airline"]}>
                <div>My Flights - Coming in next phase</div>
              </ProtectedRoute>
            } />
            <Route path="/airline/delay-manager" element={
              <ProtectedRoute allowedRoles={["airline"]}>
                <div>Delay Manager - Coming in next phase</div>
              </ProtectedRoute>
            } />
            <Route path="/airline/passenger-notify" element={
              <ProtectedRoute allowedRoles={["airline"]}>
                <div>Passenger Notify - Coming in next phase</div>
              </ProtectedRoute>
            } />
            
            {/* Passenger routes */}
            <Route path="/passenger/dashboard" element={
              <ProtectedRoute allowedRoles={["passenger"]}>
                <div>Passenger Dashboard - Coming in next phase</div>
              </ProtectedRoute>
            } />
            <Route path="/passenger/search-flights" element={
              <ProtectedRoute allowedRoles={["passenger"]}>
                <div>Search Flights - Coming in next phase</div>
              </ProtectedRoute>
            } />
            <Route path="/passenger/reserve-seat" element={
              <ProtectedRoute allowedRoles={["passenger"]}>
                <div>Reserve Seat - Coming in next phase</div>
              </ProtectedRoute>
            } />
            <Route path="/passenger/my-reservations" element={
              <ProtectedRoute allowedRoles={["passenger"]}>
                <div>My Reservations - Coming in next phase</div>
              </ProtectedRoute>
            } />
            <Route path="/passenger/my-notifications" element={
              <ProtectedRoute allowedRoles={["passenger"]}>
                <div>My Notifications - Coming in next phase</div>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
