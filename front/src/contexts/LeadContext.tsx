'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import { ApiClient } from '@/lib/api';

import { getErrorMessages } from '@/utils/errors';
import { formatEnumErrorMessage } from '@/utils/formatError';

// Types
export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  source: string;
  status:
    | 'new'
    | 'contacted'
    | 'qualified'
    | 'proposal'
    | 'negotiation'
    | 'closed_won'
    | 'closed_lost';
  score?: number;
  value?: number;
  notes?: string;
  assigned_to?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  source: string;
  status?: string;
  value?: number;
  notes?: string;
  assigned_to?: string;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  score?: number;
}

export interface LeadFilters {
  status?: string;
  source?: string;
  assigned_to?: string;
  company?: string;
  min_score?: number;
  max_score?: number;
  search?: string;
  score?: any;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// State
interface LeadState {
  leads: {
    items:Lead[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  currentLead: Lead | null;
  isLoading: boolean;
  error: string | null;
  filters: LeadFilters;
  statistics: {
    totalLeads: number,
    totalCompanies: number,
    totalContacts: number,
    activeOpportunities: number,
    monthOverMonth: {
      leads: string
    }
  }
}

// Actions
type LeadAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LEADS'; payload: { leads: Lead[]; pagination: any } }
  | { type: 'SET_CURRENT_LEAD'; payload: Lead | null }
  | { type: 'ADD_LEAD'; payload: Lead }
  | { type: 'UPDATE_LEAD'; payload: Lead }
  | { type: 'DELETE_LEAD'; payload: string }
  | { type: 'SET_FILTERS'; payload: LeadFilters }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'ADD_STATISTICS'; payload: any }

// Initial state
const initialState: LeadState = {
  leads: {
    items: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  },
  currentLead: null,
  isLoading: false,
  error: null,
  
  filters: {},

  statistics: {
    totalLeads: 0,
    totalCompanies: 0,
    totalContacts: 0,
    activeOpportunities: 0,
    monthOverMonth:{
      leads: ""
    }  
  }
};

// Reducer
function leadReducer(state: LeadState, action: LeadAction): LeadState {

  let newLeads = (state as any).leads.items.items;
  let newPagination = state.leads.pagination;

  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LEADS':
      return {
        ...state,
        leads: {
          items: action.payload.leads,
          pagination: action.payload.pagination
        },
        isLoading: false,
        error: null,
      };
    case "ADD_STATISTICS":
      return { ...state, statistics: action.payload };
    case 'SET_CURRENT_LEAD':
      return { ...state, currentLead: action.payload, isLoading: false };
    case 'ADD_LEAD':
      return {
        ...state,
         leads: {
            items: [action.payload, ...state.leads.items],
            pagination: {
              ...newPagination,
              total: newPagination.total + 1,
            },
          },
      };
    case 'UPDATE_LEAD':
      return {
        ...state,
         leads: {
            items: newLeads.map((lead: any) =>
              lead.id === action.payload.id ? action.payload : lead
            ),
            pagination: newPagination,
          },
        currentLead:
          state.currentLead?.id === action.payload.id
            ? action.payload
            : state.currentLead,
      };
    case 'DELETE_LEAD':
      return {
        ...state,
        leads: {
          items: newLeads.filter((lead: any) => lead !== (action as any).payload.id),
          pagination: newPagination
        },
        currentLead:
          state.currentLead?.id === action.payload ? null : state.currentLead,
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'CLEAR_FILTERS':
      return { ...state, filters: { } };
    default:
      return state;
  }
}

// Context
interface LeadContextType extends LeadState {
  // CRUD operations
  fetchLeads: (filters?: LeadFilters) => Promise<void>;
  fetchLead: (id: string) => Promise<void>;
  createLead: (data: CreateLeadData) => Promise<Lead>;
  updateLead: (id: string, data: UpdateLeadData) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
  updateLeadScore: (id: string, score: number) => Promise<void>;

  // Utility functions
  setFilters: (filters: LeadFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
  clearCurrentLead: () => void;
  leadstatistics: () => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

// Provider
export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(leadReducer, initialState);
  const apiClient = new ApiClient();

  const fetchLeads = useCallback(
    async (filters: LeadFilters = {}) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        const queryParams = new URLSearchParams();

        Object.entries({ ...state.filters, ...filters }).forEach(
          ([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              queryParams.append(key, String(value));
            }
          }
        );

        const res = await apiClient.get(
          `/api/v1/leads?${queryParams.toString()}`
        );

        dispatch({
          type: 'SET_LEADS',
          payload: {
            leads: (res as any).data.leads || res.data,
            pagination: (res as any).data.pagination,
          },
        });

        if (Object.keys(filters).length > 0) {
          dispatch({ type: 'SET_FILTERS', payload: filters });
        }
      } catch (error: any) {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({
          type: 'SET_ERROR',
          payload: error.message || 'Failed to fetch leads',
        });
      }
    },
    [state.filters]
  );

  const fetchLead = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = (await apiClient.get(`/api/v1/leads/${id}`)) as {
        data: Lead;
      };

      dispatch({ type: 'SET_CURRENT_LEAD', payload: response.data });

    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to fetch lead',
      });
    }
  }, []);


  const createLead = useCallback(
    async (data: CreateLeadData): Promise<Lead> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        const response = (await apiClient.post(
          '/api/v1/leads/create',
          data
        )) as { data: Lead };

        const newLead = response.data;

        dispatch({ type: 'ADD_LEAD', payload: newLead });
        return newLead;
      } catch (error: any) {
        let errorMessage = 'Failed to create lead';

        // Check for detailed validation errors from backend
        if (error.details && Array.isArray(error.details)) {
          errorMessage = error.details
            .map(
              (e: { path: string; message: string }) =>
                `${e.path}: ${e.message}`
            )
            .join('; ');
        } else {
          let messages = getErrorMessages(error);
          messages = messages.map((msg) => formatEnumErrorMessage(msg));
          errorMessage = messages.join(', ');
        }

        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw new Error(errorMessage);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    []
  );

  const updateLead = useCallback(
    async (id: string, data: UpdateLeadData): Promise<Lead> => {

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        const response = (await apiClient.put(`/api/v1/leads/update/${id}`, data)) as {
          data: Lead;
        };
        const updatedLead = response.data;

        dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });
        return updatedLead;
      } catch (error: any) {
         let errorMessage = 'Failed to update lead';

        // Check for detailed validation errors from backend
        if (error.details && Array.isArray(error.details)) {
          errorMessage = error.details
            .map(
              (e: { path: string; message: string }) =>
                `${e.path}: ${e.message}`
            )
            .join('; ');
        } else {
          let messages = getErrorMessages(error);
          messages = messages.map((msg) => formatEnumErrorMessage(msg));
          errorMessage = messages.join(', ');
        }

        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw new Error(errorMessage);
      }finally{
         dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    []
  );

  const leadstatistics = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.get("/api/v1/leads/stats");

      // Store statistics in context
      dispatch({
        type: "ADD_STATISTICS",
        payload: response.data, // <-- backend returns { success, data }
      });

    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to fetch lead statistics',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);


  const deleteLead = useCallback(async (id: string) => {
    try {
      // dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await apiClient.delete(`/api/v1/leads/delete/${id}`);
      dispatch({ type: 'DELETE_LEAD', payload: id });
    } catch (error: any) {
       let errorMessage = 'Failed to delete lead';

        // Check for detailed validation errors from backend
        if (error.details && Array.isArray(error.details)) {
          errorMessage = error.details
            .map(
              (e: { path: string; message: string }) =>
                `${e.path}: ${e.message}`
            )
            .join('; ');
        } else {
          let messages = getErrorMessages(error);
          messages = messages.map((msg) => formatEnumErrorMessage(msg));
          errorMessage = messages.join(', ');
        }

        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw new Error(errorMessage);
    }
  }, []);

  const updateLeadScore = useCallback(async (id: string, score: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = (await apiClient.patch(`/api/leads/${id}/score`, {
        score,
      })) as { data: Lead };
      const updatedLead = response.data;

      dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update lead score';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const setFilters = useCallback((filters: LeadFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const clearCurrentLead = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_LEAD', payload: null });
  }, []);

  const value: LeadContextType = {
    ...state,
    fetchLeads,
    fetchLead,
    createLead,
    updateLead,
    deleteLead,
    updateLeadScore,
    setFilters,
    clearFilters,
    clearError,
    clearCurrentLead,
    leadstatistics,
  };

  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>;
}

// Hook
export function useLeads() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
}
