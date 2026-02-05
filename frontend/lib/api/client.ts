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
      (response) => response,
      async (error) => {
        // Section 16.1: Unauthorized (401) - Redirect to login and preserve intended destination
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            // Don't redirect if already on auth pages to prevent loops
            const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
            const isAuthPage = authPages.some(page => currentPath.endsWith(page));
            if (!isAuthPage) {
              const fullPath = currentPath + window.location.search;
              const returnUrl = encodeURIComponent(fullPath);
              window.location.href = `/login?returnUrl=${returnUrl}`;
            }
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
