'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  bio?: string;
  denomination?: string;
  spiritualJourneyStage?: string;
  country?: string;
  city?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  timezone?: string;
  preferredBibleTranslation?: string;
  gender?: string;
  isEmailVerified?: boolean;
  isProfileComplete?: boolean;
  lastActive?: string;
  createdAt?: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName: string;
  confirmPassword?: string;
  spiritualJourneyStage?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<{ needsVerification: boolean }>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (emailOrUsername: string, password: string, rememberMe: boolean = false) => {
    const response = await apiClient.post('/auth/login', {
      emailOrUsername,
      password,
      rememberMe,
    });
    
    const { accessToken, refreshToken, user } = response.data.data;
    
    // Save to localStorage
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    setUser(user);
    router.push('/dashboard');
  };

  const register = async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    
    if (response.data.data.needsVerification) {
      return { needsVerification: true };
    }
    
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    
    return { needsVerification: false };
  };

  const refreshToken = async () => {
    try {
      const currentRefreshToken = localStorage.getItem('refreshToken');
      if (!currentRefreshToken) return;

      const response = await apiClient.post('/auth/refresh-token', {
        refreshToken: currentRefreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshToken, isAuthenticated: !!user }}>
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
