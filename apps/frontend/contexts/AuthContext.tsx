'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  role: 'user' | 'moderator' | 'admin' | 'super_admin';
  spiritualJourneyStage?: string;
  denomination?: string;
  country?: string;
  timezone?: string;
  emailVerified: boolean;
  status: string;
  preferredBibleTranslation?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<{ needsVerification: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshToken: () => Promise<void>;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword?: string;
  fullName: string;
  spiritualJourneyStage?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }

    // Set up token refresh interval (every 14 minutes)
    const refreshInterval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        refreshToken();
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  const loadUser = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrUsername: string, password: string, rememberMe: boolean = false) => {
    const response = await apiClient.post('/auth/login', { 
      emailOrUsername, 
      password,
      rememberMe,
    });
    
    localStorage.setItem('token', response.data.data.accessToken);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);
    setUser(response.data.data.user);
    router.push('/dashboard');
  };

  const register = async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    
    if (response.data.data.needsVerification) {
      return { needsVerification: true };
    }
    
    localStorage.setItem('token', response.data.data.token);
    setUser(response.data.data.user);
    return { needsVerification: false };
  };

  const refreshToken = async () => {
    try {
      const currentRefreshToken = localStorage.getItem('refreshToken');
      if (!currentRefreshToken) return;

      const response = await apiClient.post('/auth/refresh-token', {
        refreshToken: currentRefreshToken,
      });

      localStorage.setItem('token', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
