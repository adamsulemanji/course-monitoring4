'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logout, refreshToken } from './auth-service';


interface AuthContextType {
  isLoggedIn: boolean;
  user: any | null;
  loading: boolean;
  login: (tokens: any) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    
    // Check if user is authenticated
    const checkAuth = async () => {
      setLoading(true);
      
      try {
        const authenticated = isAuthenticated();
        setIsLoggedIn(authenticated);
        
        if (authenticated) {
          // Refresh token on initial load
          const result = await refreshToken();
          if (!result.success) {
            // If token refresh fails, log the user out
            await handleLogout();
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = (tokens: any) => {
    setIsLoggedIn(true);
    setUser(tokens); // Store user information or tokens
  };

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    setUser(null);
    // router.push('/auth/sign-in');
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        login: handleLogin,
        logout: handleLogout,
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

// HOC to protect routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const WithAuth: React.FC<P> = (props) => {
    const { isLoggedIn, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isLoggedIn) {
          router.push('/dashboard');
        }
    }, [isLoggedIn, loading, router]);

    if (loading) {
      return <div>Loading...</div>; // You could replace this with a proper loading component
    }

    if (!isLoggedIn) {
      return null; // Will redirect via useEffect
    }

    return <Component {...props} />;
  };

  return WithAuth;
}; 