'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Error handle karne ka smart tareeqa
  const handleError = (error: any, defaultMessage: string) => {
    console.error("Auth Error Full Object:", error);
    let message = defaultMessage;
    
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (Array.isArray(detail)) {
        message = detail[0]?.msg || JSON.stringify(detail);
      } else if (typeof detail === 'string') {
        message = detail;
      } else {
        message = JSON.stringify(detail);
      }
    }
    toast.error(message);
  };

  const login = async (data: any) => {
    try {
      console.log("Login Form Data Received:", data); // 👀 Debugging ke liye

      // 1. Check karen email kahan chupa hai (email mein ya username mein?)
      const emailValue = data.email || data.username;

      if (!emailValue) {
        toast.error("Email is missing in the form data!");
        return;
      }

      // 2. Form Data banayen (Backend ko yahi format pasand hai)
      const params = new URLSearchParams();
      params.append('username', emailValue); // Backend 'username' maangta hai
      params.append('password', data.password);

      // 3. Request bhejen
      const response = await api.post('/auth/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      localStorage.setItem('token', response.data.access_token);
      setIsAuthenticated(true);
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      handleError(error, 'Login failed.');
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      await api.post('/auth/register', data);
      toast.success('Registration successful! Please log in.');
      router.push('/sign-in');
    } catch (error: any) {
      handleError(error, 'Registration failed.');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    toast.success('Logged out successfully!');
    router.push('/sign-in');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};