
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-aviation-blue-light to-white">
      <div className="text-center">
        <Logo size="lg" className="justify-center mb-8" />
        
        <h1 className="text-6xl font-bold mb-4 text-aviation-navy-dark">404</h1>
        <p className="text-2xl font-medium mb-8 text-aviation-navy">Page not found</p>
        
        <p className="mb-8 text-aviation-navy-dark/70 max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Button onClick={() => navigate("/")} className="px-8">
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
