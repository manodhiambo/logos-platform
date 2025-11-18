import apiClient from './api';
import * as SecureStore from 'expo-secure-store';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  gender: string;
}

class AuthService {
  async login(data: LoginData) {
    const response = await apiClient.post('/auth/login', data);
    const { token, user } = response.data;
    
    await SecureStore.setItemAsync('authToken', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    
    return { token, user };
  }

  async register(data: RegisterData) {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  }

  async logout() {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('user');
  }

  async getCurrentUser() {
    const userStr = await SecureStore.getItemAsync('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async isAuthenticated() {
    const token = await SecureStore.getItemAsync('authToken');
    return !!token;
  }
}

export default new AuthService();
