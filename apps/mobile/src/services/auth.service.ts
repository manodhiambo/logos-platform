import apiClient from './api';
import * as SecureStore from 'expo-secure-store';

export interface LoginData {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  spiritualJourneyStage?: string;
  denomination?: string;
  country?: string;
  timezone?: string;
}

export interface User {
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
  isEmailVerified?: boolean;
}

class AuthService {
  async login(data: LoginData) {
    const response = await apiClient.post('/auth/login', data);
    const { accessToken, refreshToken, user } = response.data.data;
    
    await SecureStore.setItemAsync('token', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    
    return { token: accessToken, user };
  }

  async register(data: RegisterData) {
    const response = await apiClient.post('/auth/register', data);
    return response.data.data;
  }

  async verifyEmail(email: string, code: string) {
    const response = await apiClient.post('/auth/verify-email', { email, code });
    return response.data.data;
  }

  async resendVerification(email: string) {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  }

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
    }
  }

  async forgotPassword(email: string) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  }

  async getCurrentUser() {
    const userStr = await SecureStore.getItemAsync('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async isAuthenticated() {
    const token = await SecureStore.getItemAsync('token');
    return !!token;
  }

  async getMe() {
    const response = await apiClient.get('/auth/me');
    const user = response.data.data;
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    return user;
  }
}

export default new AuthService();
