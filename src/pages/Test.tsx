
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, LogOut, Database, Server } from 'lucide-react';
import DatabaseConnectionTest from "@/components/DatabaseConnectionTest";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Test = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [serverStatus, setServerStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  // Test database connection on page load
  useEffect(() => {
    testServerConnection();
    testDbConnection();
  }, []);
  
  const testServerConnection = async () => {
    try {
      setServerStatus('testing');
      
      // First test if the server is running at all
      const response = await fetch('http://localhost:3001/api/ping');
      if (response.ok) {
        setServerStatus('success');
      } else {
        setServerStatus('failed');
        setErrorDetails('Server is running but returned an error');
      }
    } catch (error) {
      console.error('Server connection test error:', error);
      setServerStatus('failed');
      setErrorDetails('Cannot connect to server. Make sure your backend is running on port 3001');
    }
  };
  
  const testDbConnection = async () => {
    try {
      setConnectionStatus('testing');
      
      const response = await fetch('http://localhost:3001/api/test-db-connection');
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus('success');
        setErrorDetails(null);
      } else {
        setConnectionStatus('failed');
        setErrorDetails(data.message || 'Unknown database error');
      }
    } catch (error) {
      console.error('Database connection test error:', error);
      setConnectionStatus('failed');
      setErrorDetails('Failed to complete database connection test');
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
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="mr-2 h-5 w-5" />
                Server Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testServerConnection} 
                disabled={serverStatus === 'testing'}
                className="w-full mb-4"
              >
                {serverStatus === 'testing' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Server Connection...
                  </>
                ) : (
                  'Test Server Connection'
                )}
              </Button>
              
              {serverStatus === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Server Connected</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Successfully connected to the server at http://localhost:3001.
                  </AlertDescription>
                </Alert>
              )}
              
              {serverStatus === 'failed' && (
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Server Connection Failed</AlertTitle>
                  <AlertDescription className="text-red-700">
                    {errorDetails || 'Failed to connect to the server. Make sure your server is running on port 3001.'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Database Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Database connection test using component */}
              <h3 className="text-sm font-medium mb-4">Component Test:</h3>
              <DatabaseConnectionTest />
              
              {/* Direct connection test */}
              <div className="mt-8">
                <h3 className="text-sm font-medium mb-4">Manual Database Test:</h3>
                <Button 
                  onClick={testDbConnection} 
                  disabled={connectionStatus === 'testing'}
                  className="w-full mb-4"
                >
                  {connectionStatus === 'testing' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing Database Connection...
                    </>
                  ) : (
                    'Test Database Connection'
                  )}
                </Button>
                
                {connectionStatus === 'success' && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Database Connected</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Successfully connected to the airport_management database.
                    </AlertDescription>
                  </Alert>
                )}
                
                {connectionStatus === 'failed' && (
                  <Alert className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Database Connection Failed</AlertTitle>
                    <AlertDescription className="text-red-700">
                      {errorDetails || 'Failed to connect to the database. Check server logs for details.'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Connection troubleshooting information */}
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div>
                <h3 className="font-medium">Database Settings</h3>
                <p className="text-gray-600 mt-1">
                  The application is configured to connect to:<br />
                  - Database Name: <code className="bg-gray-100 px-1 rounded">airport_management</code><br />
                  - MySQL Host: <code className="bg-gray-100 px-1 rounded">localhost</code><br />
                  - MySQL Port: <code className="bg-gray-100 px-1 rounded">3306</code><br />
                  - MySQL User: <code className="bg-gray-100 px-1 rounded">root</code><br />
                  - MySQL Password: <code className="bg-gray-100 px-1 rounded">[empty]</code>
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Common Issues</h3>
                <ul className="list-disc pl-5 mt-1 text-gray-600">
                  <li>Make sure your MySQL server is running</li>
                  <li>Verify the database "airport_management" exists</li>
                  <li>Confirm the username and password are correct</li>
                  <li>Ensure the server is running on port 3001</li>
                  <li>Check if your tables match the required schema</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium">Database Schema</h3>
                <p className="text-gray-600 mt-1">
                  The application requires the following tables:
                </p>
                <ul className="list-disc pl-5 mt-1 text-gray-600">
                  <li>users</li>
                  <li>airline_profiles</li>
                  <li>gates</li>
                  <li>runways</li>
                  <li>flights</li>
                  <li>seats</li>
                  <li>reservations</li>
                  <li>notifications</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* Logout button */}
          <div className="mt-8">
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
