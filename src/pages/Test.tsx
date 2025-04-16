
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, LogOut } from 'lucide-react';
import DatabaseConnectionTest from "@/components/DatabaseConnectionTest";

const Test = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  
  // Test database connection on page load
  useEffect(() => {
    testDbConnection();
  }, []);
  
  const testDbConnection = async () => {
    try {
      setConnectionStatus('testing');
      
      const response = await fetch('http://localhost:3001/api/test-db-connection');
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('failed');
      }
    } catch (error) {
      console.error('Database connection test error:', error);
      setConnectionStatus('failed');
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">System Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h2 className="text-xl font-semibold">Database Connection Status</h2>
          
          {/* Database connection test using component */}
          <DatabaseConnectionTest />
          
          {/* Direct connection test */}
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold">Manual Connection Test</h2>
            <Button 
              onClick={testDbConnection} 
              disabled={connectionStatus === 'testing'}
              className="w-full"
            >
              {connectionStatus === 'testing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                'Test Database Connection'
              )}
            </Button>
            
            {connectionStatus === 'success' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Connected</AlertTitle>
                <AlertDescription className="text-green-700">
                  Successfully connected to the database.
                </AlertDescription>
              </Alert>
            )}
            
            {connectionStatus === 'failed' && (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Connection Failed</AlertTitle>
                <AlertDescription className="text-red-700">
                  Failed to connect to the database. Check server logs for details.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          {/* Logout button */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <Button 
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
