// API Configuration and Types
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  code?: string;
  details?: any;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'sales_rep' | 'marketer';
  status: 'active' | 'inactive' | 'pending';
  avatar_url?: string;
  tenant_id: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notification_settings?: {
      email?: boolean;
      push?: boolean;
      digest_frequency?: 'never' | 'daily' | 'weekly';
    };
    default_dashboard?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'admin' | 'manager' | 'sales_rep' | 'marketer';
  tenant_id?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role?: 'admin' | 'manager' | 'sales_rep' | 'marketer';
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notification_settings?: {
      email?: boolean;
      push?: boolean;
      digest_frequency?: 'never' | 'daily' | 'weekly';
    };
    default_dashboard?: string;
  };
}

export interface PasswordResetData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTP Client utility
export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    
    // Initialize token from localStorage or cookies if available
    if (typeof window !== 'undefined') {
      // First try localStorage
      this.token = localStorage.getItem('auth_token');
      
      // If not in localStorage, try cookies (for middleware compatibility)
      if (!this.token) {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
        if (authCookie) {
          this.token = authCookie.split('=')[1];
          // Also store in localStorage for consistency
          localStorage.setItem('auth_token', this.token);
        }
      }
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
        // Also set cookie for middleware
        document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;
      } else {
        localStorage.removeItem('auth_token');
        // Also remove cookie
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.code || 'UNKNOWN_ERROR',
          data.message || 'An error occurred',
          data.details
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        error instanceof Error ? error.message : 'Network error occurred'
      );
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth Methods
  async requestPasswordReset(data: PasswordResetData): Promise<ApiResponse> {
    return this.post('/api/v1/auth/reset-password-request', data);
  }

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    return this.post('/api/v1/auth/reset-password', data);
  }

  // Admin methods
  async getPendingUsers(): Promise<ApiResponse<User[]>> {
    return this.get('/api/v1/auth/admin/pending-users');
  }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.get('/api/v1/auth/admin/all-users');
  }

  async getUsersByStatus(status: 'active' | 'inactive' | 'pending'): Promise<ApiResponse<User[]>> {
    return this.get(`/api/v1/auth/admin/users?status=${status}`);
  }

  async approveUser(userId: string, role?: 'admin' | 'manager' | 'sales_rep' | 'marketer') {
    return this.patch(`/api/v1/auth/admin/approve-user/${userId}`, { role });
  }

  async rejectUser(userId: string, reason?: string) {
    return this.delete(`/api/v1/auth/admin/reject-user/${userId}`);
  }

  async updateUserStatus(userId: string, status: 'active' | 'inactive') {
    return this.patch(`/api/v1/auth/admin/user-status/${userId}`, { status });
  }

  async updateUserRole(userId: string, role: 'admin' | 'manager' | 'sales_rep' | 'marketer') {
    return this.patch(`/api/v1/auth/admin/user-role/${userId}`, { role });
  }

  async verifyToken(data: { idToken: string }): Promise<ApiResponse<{ user: any; token: string }>> {
    return this.post('/api/v1/auth/verify-token', data);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();