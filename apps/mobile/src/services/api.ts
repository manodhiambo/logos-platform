import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Use your production backend URL
const API_URL = 'https://logos-platform.onrender.com/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle API response structure
apiClient.interceptors.response.use(
  (response) => {
    // Backend returns data in response.data.data format
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('user');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
