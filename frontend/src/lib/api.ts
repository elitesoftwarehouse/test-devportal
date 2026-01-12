/**
 * Elite Portal - HTTP Client
 * Centralized API client with interceptors and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add any auth headers if needed
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Type-safe API methods
export const apiClient = {
  get: <T>(url: string, config?: object) => api.get<T>(url, config),
  post: <T>(url: string, data?: object, config?: object) => api.post<T>(url, data, config),
  put: <T>(url: string, data?: object, config?: object) => api.put<T>(url, data, config),
  patch: <T>(url: string, data?: object, config?: object) => api.patch<T>(url, data, config),
  delete: <T>(url: string, config?: object) => api.delete<T>(url, config),
};

