
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-aviation-blue-light to-white">
      <div className="text-center">
        <Logo size="lg" className="justify-center mb-8" />
        
        <h1 className="text-6xl font-bold mb-4 text-aviation-navy-dark">404</h1>
        <p className="text-2xl font-medium mb-8 text-aviation-navy">Page not found</p>
        
        <p className="mb-8 text-aviation-navy-dark/70 max-w-md">
          The page <span className="font-medium">{location.pathname}</span> you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <Button onClick={() => navigate("/")} className="px-8">
            Return to Home
          </Button>
          
          <div className="text-sm text-gray-500">
            If you're trying to access an admin page, please check with your administrator for correct permissions and URLs.
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
