'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { ApiClient } from '@/lib/api';

// Types
export interface Account {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  billing_address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  shipping_address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  annual_revenue?: number;
  employee_count?: number;
  type: 'prospect' | 'customer' | 'partner' | 'competitor';
  status: 'active' | 'inactive';
  assigned_to: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountData {
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  billing_address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  shipping_address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  annual_revenue?: number;
  employee_count?: number;
  type?: 'prospect' | 'customer' | 'partner' | 'competitor';
  assigned_to?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface UpdateAccountData extends Partial<CreateAccountData> {
  status?: 'active' | 'inactive';
}

export interface AccountFilters {
  type?: string;
  status?: string;
  industry?: string;
  assigned_to?: string;
  min_revenue?: number;
  max_revenue?: number;
  min_employees?: number;
  max_employees?: number;
  search?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// State
interface AccountState {
  accounts: Account[];
  currentAccount: Account | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: AccountFilters;
}

// Actions
type AccountAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACCOUNTS'; payload: { accounts: Account[]; pagination: any } }
  | { type: 'SET_CURRENT_ACCOUNT'; payload: Account | null }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'SET_FILTERS'; payload: AccountFilters }
  | { type: 'CLEAR_FILTERS' };

// Initial state
const initialState: AccountState = {
  accounts: [],
  currentAccount: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {},
};

// Reducer
function accountReducer(state: AccountState, action: AccountAction): AccountState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_ACCOUNTS':
      return {
        ...state,
        accounts: action.payload.accounts,
        pagination: action.payload.pagination,
        isLoading: false,
        error: null,
      };
    case 'SET_CURRENT_ACCOUNT':
      return { ...state, currentAccount: action.payload };
    case 'ADD_ACCOUNT':
      return {
        ...state,
        accounts: [action.payload, ...state.accounts],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === action.payload.id ? action.payload : account
        ),
        currentAccount: state.currentAccount?.id === action.payload.id ? action.payload : state.currentAccount,
      };
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter(account => account.id !== action.payload),
        currentAccount: state.currentAccount?.id === action.payload ? null : state.currentAccount,
        pagination: { ...state.pagination, total: state.pagination.total - 1 },
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'CLEAR_FILTERS':
      return { ...state, filters: {} };
    default:
      return state;
  }
}

// Context
interface AccountContextType extends AccountState {
  // CRUD operations
  fetchAccounts: (filters?: AccountFilters) => Promise<void>;
  fetchAccount: (id: string) => Promise<void>;
  createAccount: (data: CreateAccountData) => Promise<Account>;
  updateAccount: (id: string, data: UpdateAccountData) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  
  // Utility functions
  setFilters: (filters: AccountFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
  clearCurrentAccount: () => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

// Provider
export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(accountReducer, initialState);
  const apiClient = new ApiClient();

  const fetchAccounts = useCallback(async (filters: AccountFilters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const queryParams = new URLSearchParams();
      Object.entries({ ...state.filters, ...filters }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/api/accounts?${queryParams.toString()}`) as { data: any };
      
      dispatch({
        type: 'SET_ACCOUNTS',
        payload: {
          accounts: (response.data.accounts || response.data) as Account[],
          pagination: response.data.pagination || {
            page: 1,
            limit: 20,
            total: (response.data.length || 0) as number,
            totalPages: 1,
          },
        },
      });

      if (filters && Object.keys(filters).length > 0) {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch accounts' });
      console.error('Error fetching accounts:', error);
    }
  }, [state.filters]);

  const fetchAccount = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.get(`/api/accounts/${id}`) as { data: Account };
      dispatch({ type: 'SET_CURRENT_ACCOUNT', payload: response.data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch account' });
      console.error('Error fetching account:', error);
    }
  }, []);

  const createAccount = useCallback(async (data: CreateAccountData): Promise<Account> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.post('/api/accounts', data) as { data: Account };
      const newAccount = response.data;

      dispatch({ type: 'ADD_ACCOUNT', payload: newAccount });
      return newAccount;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create account';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const updateAccount = useCallback(async (id: string, data: UpdateAccountData): Promise<Account> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.put(`/api/accounts/${id}`, data) as { data: Account };
      const updatedAccount = response.data;

      dispatch({ type: 'UPDATE_ACCOUNT', payload: updatedAccount });
      return updatedAccount;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update account';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const deleteAccount = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await apiClient.delete(`/api/accounts/${id}`);
      dispatch({ type: 'DELETE_ACCOUNT', payload: id });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete account';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const setFilters = useCallback((filters: AccountFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const clearCurrentAccount = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_ACCOUNT', payload: null });
  }, []);

  const value: AccountContextType = {
    ...state,
    fetchAccounts,
    fetchAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    setFilters,
    clearFilters,
    clearError,
    clearCurrentAccount,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}

// Hook
export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
}