
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const DatabaseConnectionTest = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Test connection on component mount
  useEffect(() => {
    testConnection();
  }, []);
  
  const testConnection = async () => {
    try {
      setStatus('testing');
      setErrorMessage(null);
      
      // Update the endpoint to match the one defined in server.js
      const response = await fetch('http://localhost:3001/api/test-connection');
      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
      } else {
        setStatus('failed');
        setErrorMessage(data.message || 'Unknown database error');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setStatus('failed');
      setErrorMessage('Failed to connect to the database service');
    }
  };
  
  return (
    <div className="space-y-4">
      <Button 
        onClick={testConnection}
        disabled={status === 'testing'}
        className="w-full"
      >
        {status === 'testing' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testing Connection...
          </>
        ) : (
          'Test Database Connection'
        )}
      </Button>
      
      {status === 'success' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Connected</AlertTitle>
          <AlertDescription className="text-green-700">
            Successfully connected to the airport_db database.
          </AlertDescription>
        </Alert>
      )}
      
      {status === 'failed' && (
        <Alert className="bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Connection Failed</AlertTitle>
          <AlertDescription className="text-red-700">
            {errorMessage || 'Failed to connect to the database. Check server logs for details.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DatabaseConnectionTest;
