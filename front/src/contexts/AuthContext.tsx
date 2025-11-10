'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  apiClient, 
  ApiError,
  AuthResponse, 
  User, 
  RegisterData, 
  LoginData, 
  UpdateProfileData,
  PasswordResetData,
  ResetPasswordData
} from '@/lib/api';

interface AuthContextType {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Methods
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  requestPasswordReset: (data: PasswordResetData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = apiClient.getToken();
      
      if (token) {
        try {
          await refreshUser();
        } catch (error) {
          // Token is invalid, clear it
          apiClient.setToken(null);
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData): Promise<void> => {
    try {
      setIsLoading(true);
      
      // 1. Sign in with Firebase
      const firebaseResult = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // 2. Get Firebase ID token
      const idToken = await firebaseResult.user.getIdToken();
      
      // 3. Send ID token to backend for verification and get user profile
      const response = await apiClient.post<AuthResponse>('/api/v1/auth/verify-token', { 
        idToken 
      });
      
      if (response.status === 'success' && response.data) {
        apiClient.setToken(response.data.token);
        setUser(response.data.user);
      } else {
        throw new ApiError(400, 'LOGIN_FAILED', 'Login failed');
      }
    } catch (error: any) {
      setUser(null);
      apiClient.setToken(null);
      
      // Handle Firebase-specific errors
      if (error.code === 'auth/user-not-found') {
        throw new ApiError(404, 'USER_NOT_FOUND', 'No account found with this email address');
      } else if (error.code === 'auth/wrong-password') {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        throw new ApiError(400, 'INVALID_EMAIL', 'Invalid email address');
      } else if (error.code === 'auth/user-disabled') {
        throw new ApiError(401, 'ACCOUNT_DISABLED', 'This account has been disabled');
      }
      
      // Handle backend API errors with better messages
      if (error instanceof ApiError) {
        if (error.code === 'ACCOUNT_PENDING') {
          throw new ApiError(401, 'ACCOUNT_PENDING', 'Your account is pending approval by an administrator. You will receive an email notification once approved.');
        } else if (error.code === 'ACCOUNT_INACTIVE') {
          throw new ApiError(401, 'ACCOUNT_INACTIVE', 'Your account has been deactivated. Please contact support for assistance.');
        }
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      
      // 1. Create user in Firebase
      const firebaseResult = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // 2. Get Firebase ID token
      const idToken = await firebaseResult.user.getIdToken();
      
      // 3. Send user data to backend for profile creation
      const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', {
        ...data,
        idToken // Include Firebase ID token for user verification
      });
      
      if (response.status === 'success' && response.data) {
        apiClient.setToken(response.data.token);
        setUser(response.data.user);
      } else {
        throw new ApiError(400, 'REGISTRATION_FAILED', 'Registration failed');
      }
    } catch (error: any) {
      setUser(null);
      apiClient.setToken(null);
      
      // Handle Firebase-specific errors
      if (error.code === 'auth/email-already-in-use') {
        throw new ApiError(400, 'EMAIL_EXISTS', 'An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        throw new ApiError(400, 'WEAK_PASSWORD', 'Password is too weak');
      } else if (error.code === 'auth/invalid-email') {
        throw new ApiError(400, 'INVALID_EMAIL', 'Invalid email address');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      apiClient.setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Firebase logout fails, clear local state
      apiClient.setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiClient.patch<User>('/api/v1/auth/profile', data);
      
      if (response.status === 'success' && response.data) {
        setUser(response.data);
      } else {
        throw new ApiError(400, 'UPDATE_FAILED', 'Profile update failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (data: PasswordResetData): Promise<void> => {
    try {
      setIsLoading(true);
      await apiClient.post('/api/v1/auth/reset-password-request', data);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData): Promise<void> => {
    try {
      setIsLoading(true);
      await apiClient.post('/api/v1/auth/reset-password', data);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await apiClient.get<User>('/api/v1/auth/profile');
      
      if (response.status === 'success' && response.data) {
        setUser(response.data);
      } else {
        throw new ApiError(400, 'FETCH_USER_FAILED', 'Failed to fetch user data');
      }
    } catch (error) {
      setUser(null);
      apiClient.setToken(null);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    requestPasswordReset,
    resetPassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Custom hooks for specific auth operations
export function useLogin() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginData) => {
    try {
      setError(null);
      await login(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    }
  };

  return { login: handleLogin, isLoading, error, clearError: () => setError(null) };
}

export function useRegister() {
  const { register, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data: RegisterData) => {
    try {
      setError(null);
      await register(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    }
  };

  return { register: handleRegister, isLoading, error, clearError: () => setError(null) };
}

export function usePasswordReset() {
  const { requestPasswordReset, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestReset = async (data: PasswordResetData) => {
    try {
      setIsLoading(true);
      setError(null);
      await requestPasswordReset(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordData) => {
    try {
      setIsLoading(true);
      setError(null);
      await resetPassword(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    requestReset: handleRequestReset,
    resetPassword: handleResetPassword,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}