'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ needsVerification: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  spiritualJourneyStage: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, token, refreshToken } = response.data.data;

      // Check if email is verified
      if (!user.emailVerified) {
        throw new Error('Please verify your email before logging in. Check your inbox.');
      }

      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      console.log('Sending registration data:', data);
      const response = await apiClient.post('/auth/register', data);
      console.log('Registration response:', response.data);
      
      // Don't log in automatically, return success
      return { needsVerification: true };
    } catch (error: any) {
      console.error('Registration error:', error.response?.data);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error?.message || 
        'Registration failed'
      );
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
