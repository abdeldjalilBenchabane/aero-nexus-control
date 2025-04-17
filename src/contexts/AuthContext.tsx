
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Ensure the user object has the required fields
        if (parsedUser.role === 'airline' && !parsedUser.airlineId) {
          // For airline users, use their ID as airlineId if not present
          parsedUser.airlineId = parsedUser.id;
        }
        
        // Add name parts if not present
        if (!parsedUser.firstName || !parsedUser.lastName) {
          const nameParts = parsedUser.name?.split(' ') || ['User', ''];
          parsedUser.firstName = parsedUser.firstName || nameParts[0];
          parsedUser.lastName = parsedUser.lastName || nameParts.slice(1).join(' ');
        }
        
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      if (data.user) {
        // Add additional fields if needed
        if (data.user.role === 'airline' && !data.user.airlineId) {
          data.user.airlineId = data.user.id;
        }
        
        // Add name parts if not present
        if (!data.user.firstName || !data.user.lastName) {
          const nameParts = data.user.name?.split(' ') || ['User', ''];
          data.user.firstName = data.user.firstName || nameParts[0];
          data.user.lastName = data.user.lastName || nameParts.slice(1).join(' ');
        }
        
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
