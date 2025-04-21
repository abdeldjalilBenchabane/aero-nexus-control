
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
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Test from "./pages/Test";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageGates from "./pages/admin/ManageGates";
import ManageRunways from "./pages/admin/ManageRunways";
import Reports from "./pages/admin/Reports";
import SystemSettings from "./pages/admin/SystemSettings";
import AdminSendNotification from "./pages/admin/SendNotification";

// Staff pages
import StaffDashboard from "./pages/staff/Dashboard";
import ManageFlights from "./pages/staff/ManageFlights";
import RealTimeFlights from "./pages/staff/RealTimeFlights";
import StaffSendNotification from "./pages/staff/SendNotification";

// Airline pages
import AirlineDashboard from "./pages/airline/Dashboard";
import MyFlights from "./pages/airline/MyFlights";
import AirplaneManagement from "./pages/airline/AirplaneManagement";
import AirlineNotifications from "./pages/airline/Notifications";
import DelayManager from "./pages/airline/DelayManager";
import PassengerNotify from "./pages/airline/PassengerNotify";

// Passenger pages
import PassengerDashboard from "./pages/passenger/Dashboard";
import SearchFlights from "./pages/passenger/SearchFlights";
import ReserveSeat from "./pages/passenger/ReserveSeat";
import MyReservations from "./pages/passenger/MyReservations";
import MyNotifications from "./pages/passenger/MyNotifications";
import FlightDetails from "./pages/passenger/FlightDetails";
import PassengerFlightPage from "./pages/passenger/flight/[id]";

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
            <Route path="/signup" element={<Signup />} />
            <Route path="/test" element={<Test />} />
            
            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/gates" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageGates />
              </ProtectedRoute>
            } />
            <Route path="/admin/runways" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageRunways />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SystemSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/send-notification" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminSendNotification />
              </ProtectedRoute>
            } />
            
            {/* Staff routes */}
            <Route path="/staff/dashboard" element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <StaffDashboard />
              </ProtectedRoute>
            } />
            <Route path="/staff/flights" element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <ManageFlights />
              </ProtectedRoute>
            } />
            <Route path="/staff/real-time-flights" element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <RealTimeFlights />
              </ProtectedRoute>
            } />
            <Route path="/staff/send-notification" element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <StaffSendNotification />
              </ProtectedRoute>
            } />
            
            {/* Airline routes */}
            <Route path="/airline/dashboard" element={
              <ProtectedRoute allowedRoles={["airline"]}>
                <AirlineDashboard />
              </ProtectedRoute>
            } />
            <Route path="/airline/flights" element={
              <ProtectedRoute allowedRoles={["airline"]}>
                <MyFlights />
              </ProtectedRoute>
            } />
            <Route path="/airline/airplanes" element={
              <ProtectedRoute allowedRoles={["airline"]}>
                <AirplaneManagement />
              </ProtectedRoute>
            } />
            <Route path="/airline/notifications" element={
              <ProtectedRoute allowedRoles={["airline"]}>
                <AirlineNotifications />
              </ProtectedRoute>
            } />
            <Route path="/airline/delay-manager" element={
              <ProtectedRoute allowedRoles={["airline"]}>
                <DelayManager />
              </ProtectedRoute>
            } />
            <Route path="/airline/passenger-notify" element={
              <ProtectedRoute allowedRoles={["airline"]}>
                <PassengerNotify />
              </ProtectedRoute>
            } />
            
            {/* Passenger routes */}
            <Route path="/passenger/dashboard" element={
              <ProtectedRoute allowedRoles={["passenger"]}>
                <PassengerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/passenger/search-flights" element={
              <ProtectedRoute allowedRoles={["passenger"]}>
                <SearchFlights />
              </ProtectedRoute>
            } />
            <Route path="/passenger/reserve-seat" element={
              <ProtectedRoute allowedRoles={["passenger"]}>
                <ReserveSeat />
              </ProtectedRoute>
            } />
            <Route path="/passenger/my-reservations" element={
              <ProtectedRoute allowedRoles={["passenger"]}>
                <MyReservations />
              </ProtectedRoute>
            } />
            <Route path="/passenger/my-notifications" element={
              <ProtectedRoute allowedRoles={["passenger"]}>
                <MyNotifications />
              </ProtectedRoute>
            } />
            <Route path="/passenger/flight-details/:id" element={
              <ProtectedRoute allowedRoles={["passenger"]}>
                <FlightDetails />
              </ProtectedRoute>
            } />
            <Route path="/passenger/flight/:id" element={
              <ProtectedRoute allowedRoles={["passenger"]}>
                <PassengerFlightPage />
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
