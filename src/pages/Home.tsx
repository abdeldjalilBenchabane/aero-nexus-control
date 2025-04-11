
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { PlaneTakeoff, Users, Clock, Bell } from "lucide-react";

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Redirect to the appropriate dashboard based on user role
    switch (user?.role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "staff":
        navigate("/staff/dashboard");
        break;
      case "airline":
        navigate("/airline/dashboard");
        break;
      case "passenger":
        navigate("/passenger/dashboard");
        break;
      default:
        navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-gradient-to-b from-aviation-blue-light to-white">
        <div className="max-w-4xl mx-auto text-center">
          <Logo size="lg" className="justify-center mb-8" />
          
          <h1 className="text-5xl font-bold mb-6 text-aviation-navy-dark">
            Airport Flight Management System
          </h1>
          
          <p className="text-xl text-aviation-navy mb-12 max-w-2xl mx-auto">
            Comprehensive solution for managing flights, gates, passengers, and notifications across all airport operations.
          </p>
          
          <Button onClick={handleGetStarted} className="text-lg py-6 px-8">
            {isAuthenticated ? "Go to Dashboard" : "Get Started"}
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-aviation-navy-dark">
            Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<PlaneTakeoff className="h-12 w-12 text-aviation-blue" />}
              title="Flight Management"
              description="Create, update, and track flights with real-time status information"
            />
            
            <FeatureCard 
              icon={<Users className="h-12 w-12 text-aviation-blue" />}
              title="Role-Based Access"
              description="Specialized interfaces for admin, staff, airlines and passengers"
            />
            
            <FeatureCard 
              icon={<Clock className="h-12 w-12 text-aviation-blue" />}
              title="Gate & Runway Scheduling"
              description="Smart allocation of airport resources based on flight timing"
            />
            
            <FeatureCard 
              icon={<Bell className="h-12 w-12 text-aviation-blue" />}
              title="Targeted Notifications"
              description="Send important updates to specific flights, roles or individuals"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 bg-aviation-navy-dark text-white text-center">
        <Logo className="justify-center mb-4 text-white" />
        <p className="text-sm opacity-75">© 2023 AeroNexus Control. All rights reserved.</p>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-aviation-gray-light hover:shadow-lg transition-shadow flex flex-col items-center text-center">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-aviation-navy-dark">{title}</h3>
    <p className="text-aviation-navy/80">{description}</p>
  </div>
);

export default Home;
