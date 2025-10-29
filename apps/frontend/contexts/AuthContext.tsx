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
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ needsVerification: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
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
  }, []);

  const loadUser = async () => {
    try {
      const response = await apiClient.get('/users/profile');
      setUser(response.data.data);
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrUsername: string, password: string) => {
    const response = await apiClient.post('/auth/login', { 
      emailOrUsername, 
      password 
    });
    localStorage.setItem('token', response.data.data.token);
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

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated }}>
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
