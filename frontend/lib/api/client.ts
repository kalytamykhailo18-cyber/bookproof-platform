import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'bookproof_token';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      timeout: 30000, // 30 second timeout for all requests
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add JWT token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor - handle errors globally
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        // Only show toast in browser environment
        if (typeof window !== 'undefined') {
          // Dynamically import toast to avoid SSR issues
          const { toast } = await import('sonner');

          // Handle different error types
          if (status === 401) {
            toast.error('Session expired. Please login again.');
            this.clearToken();
            // Also clear Zustand auth store
            const { useAuthStore } = await import('@/store/authStore');
            useAuthStore.getState().clearUser();
            // Don't redirect - let user stay on current page
            // They can click login button themselves
          } else if (status === 403) {
            toast.error('You do not have permission for this action.');
          } else if (status === 404) {
            toast.error('Resource not found.');
          } else if (status === 429) {
            toast.error('Too many requests. Please slow down.');
          } else if (status >= 500) {
            toast.error('Server error. Please try again later.');
          } else if (error.code === 'ECONNABORTED') {
            toast.error('Request timeout. Please try again.');
          } else if (error.code === 'ERR_NETWORK') {
            toast.error('Network error. Check your connection.');
          } else if (message) {
            // Show backend error message
            toast.error(message);
          } else {
            toast.error('Something went wrong. Please try again.');
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // Token management methods
  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  public getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  public clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  get instance() {
    return this.client;
  }
}

const apiClientInstance = new ApiClient();
export const apiClient = apiClientInstance.instance;
export const client = apiClientInstance.instance; // Backwards compatibility
export const tokenManager = {
  setToken: apiClientInstance.setToken.bind(apiClientInstance),
  getToken: apiClientInstance.getToken.bind(apiClientInstance),
  clearToken: apiClientInstance.clearToken.bind(apiClientInstance),
};
export default apiClient;
