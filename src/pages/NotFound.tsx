
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Determine the dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return "/";
    
    switch (user.role) {
      case "admin": return "/admin/dashboard";
      case "staff": return "/staff/dashboard";
      case "airline": return "/airline/dashboard";
      case "passenger": return "/passenger/dashboard";
      default: return "/";
    }
  };

  // Suggest alternative paths based on the current path
  const getSuggestedPaths = () => {
    const path = location.pathname;
    const suggestions = [];
    
    if (path.includes('/admin/')) {
      suggestions.push({ label: "Admin Dashboard", path: "/admin/dashboard" });
      suggestions.push({ label: "Manage Users", path: "/admin/users" });
      suggestions.push({ label: "Manage Gates", path: "/admin/gates" });
      suggestions.push({ label: "Manage Runways", path: "/admin/runways" });
    }
    else if (path.includes('/staff/')) {
      suggestions.push({ label: "Staff Dashboard", path: "/staff/dashboard" });
      suggestions.push({ label: "Manage Flights", path: "/staff/flights" });
      suggestions.push({ label: "Real-time Flights", path: "/staff/real-time-flights" });
    }
    else if (path.includes('/airline/')) {
      suggestions.push({ label: "Airline Dashboard", path: "/airline/dashboard" });
      suggestions.push({ label: "My Flights", path: "/airline/flights" });
      suggestions.push({ label: "My Airplanes", path: "/airline/airplanes" });
      suggestions.push({ label: "Notifications", path: "/airline/notifications" });
    }
    else if (path.includes('/passenger/')) {
      suggestions.push({ label: "Passenger Dashboard", path: "/passenger/dashboard" });
      suggestions.push({ label: "Search Flights", path: "/passenger/search-flights" });
      suggestions.push({ label: "My Reservations", path: "/passenger/my-reservations" });
    }
    
    return suggestions;
  };

  const suggestions = getSuggestedPaths();
  const dashboardPath = getDashboardPath();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-aviation-blue-light to-white">
      <div className="text-center max-w-md">
        <Logo size="lg" className="justify-center mb-8" />
        
        <h1 className="text-6xl font-bold mb-4 text-aviation-navy-dark">404</h1>
        <p className="text-2xl font-medium mb-4 text-aviation-navy">Page not found</p>
        
        <p className="mb-6 text-aviation-navy-dark/70">
          The page <span className="font-medium">{location.pathname}</span> you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </Button>
            
            <Button onClick={() => navigate(dashboardPath)} className="flex items-center gap-2">
              <Home size={16} />
              <span>{user ? "Go to Dashboard" : "Go to Home"}</span>
            </Button>
          </div>
          
          {suggestions.length > 0 && (
            <div className="mt-8">
              <p className="text-sm font-medium text-gray-600 mb-3">You might be looking for:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button 
                    key={index} 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(suggestion.path)}
                    className="text-sm"
                  >
                    {suggestion.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
