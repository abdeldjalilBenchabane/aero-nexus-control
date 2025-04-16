
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const DatabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      setErrorMessage(null);
      
      const response = await fetch('http://localhost:3001/api/test-db-connection');
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('failed');
        setErrorMessage(data.message);
      }
    } catch (error) {
      setConnectionStatus('failed');
      setErrorMessage('Failed to connect to server. Make sure your server is running.');
      console.error('Connection test error:', error);
    }
  };

  useEffect(() => {
    // Test connection on component mount
    testConnection();
  }, []);

  return (
    <div className="space-y-4">
      <Button 
        onClick={testConnection} 
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
            {errorMessage || 'Failed to connect to the database. Check server logs for details.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DatabaseConnectionTest;
