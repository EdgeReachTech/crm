'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { ApiClient } from '@/lib/api';

// Types
export interface Opportunity {
  id: string;
  name: string;
  description?: string;
  account_id: string;
  contact_id?: string;
  lead_id?: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  amount: number;
  probability: number;
  expected_close_date: string;
  actual_close_date?: string;
  currency: string;
  source?: string;
  assigned_to: string;
  notes?: string;
  tags?: string[];
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOpportunityData {
  name: string;
  description?: string;
  account_id: string;
  contact_id?: string;
  lead_id?: string;
  stage?: string;
  amount: number;
  probability?: number;
  expected_close_date: string;
  currency?: string;
  source?: string;
  assigned_to?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateOpportunityData extends Partial<CreateOpportunityData> {
  actual_close_date?: string;
}

export interface OpportunityFilters {
  account_id?: string;
  contact_id?: string;
  stage?: string;
  assigned_to?: string;
  min_amount?: number;
  max_amount?: number;
  min_probability?: number;
  max_probability?: number;
  currency?: string;
  source?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// State
interface OpportunityState {
  opportunities: Opportunity[];
  currentOpportunity: Opportunity | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: OpportunityFilters;
}

// Actions
type OpportunityAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_OPPORTUNITIES'; payload: { opportunities: Opportunity[]; pagination: any } }
  | { type: 'SET_CURRENT_OPPORTUNITY'; payload: Opportunity | null }
  | { type: 'ADD_OPPORTUNITY'; payload: Opportunity }
  | { type: 'UPDATE_OPPORTUNITY'; payload: Opportunity }
  | { type: 'DELETE_OPPORTUNITY'; payload: string }
  | { type: 'SET_FILTERS'; payload: OpportunityFilters }
  | { type: 'CLEAR_FILTERS' };

// Initial state
const initialState: OpportunityState = {
  opportunities: [],
  currentOpportunity: null,
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
function opportunityReducer(state: OpportunityState, action: OpportunityAction): OpportunityState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_OPPORTUNITIES':
      return {
        ...state,
        opportunities: action.payload.opportunities,
        pagination: action.payload.pagination,
        isLoading: false,
        error: null,
      };
    case 'SET_CURRENT_OPPORTUNITY':
      return { ...state, currentOpportunity: action.payload };
    case 'ADD_OPPORTUNITY':
      return {
        ...state,
        opportunities: [action.payload, ...state.opportunities],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    case 'UPDATE_OPPORTUNITY':
      return {
        ...state,
        opportunities: state.opportunities.map(opportunity =>
          opportunity.id === action.payload.id ? action.payload : opportunity
        ),
        currentOpportunity: state.currentOpportunity?.id === action.payload.id ? action.payload : state.currentOpportunity,
      };
    case 'DELETE_OPPORTUNITY':
      return {
        ...state,
        opportunities: state.opportunities.filter(opportunity => opportunity.id !== action.payload),
        currentOpportunity: state.currentOpportunity?.id === action.payload ? null : state.currentOpportunity,
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
interface OpportunityContextType extends OpportunityState {
  // CRUD operations
  fetchOpportunities: (filters?: OpportunityFilters) => Promise<void>;
  fetchOpportunity: (id: string) => Promise<void>;
  createOpportunity: (data: CreateOpportunityData) => Promise<Opportunity>;
  updateOpportunity: (id: string, data: UpdateOpportunityData) => Promise<Opportunity>;
  deleteOpportunity: (id: string) => Promise<void>;
  
  // Utility functions
  setFilters: (filters: OpportunityFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
  clearCurrentOpportunity: () => void;
}

const OpportunityContext = createContext<OpportunityContextType | undefined>(undefined);

// Provider
export function OpportunityProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(opportunityReducer, initialState);
  const apiClient = new ApiClient();

  const fetchOpportunities = useCallback(async (filters: OpportunityFilters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const queryParams = new URLSearchParams();
      Object.entries({ ...state.filters, ...filters }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/api/opportunities?${queryParams.toString()}`) as { data: any };
      
      dispatch({
        type: 'SET_OPPORTUNITIES',
        payload: {
          opportunities: (response.data.opportunities || response.data) as Opportunity[],
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
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch opportunities' });
      console.error('Error fetching opportunities:', error);
    }
  }, [state.filters]);

  const fetchOpportunity = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.get(`/api/opportunities/${id}`) as { data: Opportunity };
      dispatch({ type: 'SET_CURRENT_OPPORTUNITY', payload: response.data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch opportunity' });
      console.error('Error fetching opportunity:', error);
    }
  }, []);

  const createOpportunity = useCallback(async (data: CreateOpportunityData): Promise<Opportunity> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.post('/api/opportunities', data) as { data: Opportunity };
      const newOpportunity = response.data;

      dispatch({ type: 'ADD_OPPORTUNITY', payload: newOpportunity });
      return newOpportunity;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create opportunity';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const updateOpportunity = useCallback(async (id: string, data: UpdateOpportunityData): Promise<Opportunity> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.put(`/api/opportunities/${id}`, data) as { data: Opportunity };
      const updatedOpportunity = response.data;

      dispatch({ type: 'UPDATE_OPPORTUNITY', payload: updatedOpportunity });
      return updatedOpportunity;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update opportunity';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const deleteOpportunity = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await apiClient.delete(`/api/opportunities/${id}`);
      dispatch({ type: 'DELETE_OPPORTUNITY', payload: id });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete opportunity';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const setFilters = useCallback((filters: OpportunityFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const clearCurrentOpportunity = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_OPPORTUNITY', payload: null });
  }, []);

  const value: OpportunityContextType = {
    ...state,
    fetchOpportunities,
    fetchOpportunity,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    setFilters,
    clearFilters,
    clearError,
    clearCurrentOpportunity,
  };

  return (
    <OpportunityContext.Provider value={value}>
      {children}
    </OpportunityContext.Provider>
  );
}

// Hook
export function useOpportunities() {
  const context = useContext(OpportunityContext);
  if (context === undefined) {
    throw new Error('useOpportunities must be used within an OpportunityProvider');
  }
  return context;
}