'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { ApiClient } from '@/lib/api';

// Types
export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;
  department?: string;
  account_id: string;
  lead_id?: string;
  status: 'active' | 'inactive';
  notes?: string;
  tags?: string[];
  social_profiles?: {
    linkedin?: string;
    twitter?: string;
  };
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContactData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;
  department?: string;
  account_id: string;
  lead_id?: string;
  notes?: string;
  tags?: string[];
  social_profiles?: {
    linkedin?: string;
    twitter?: string;
  };
}

export interface UpdateContactData extends Partial<CreateContactData> {
  status?: 'active' | 'inactive';
}

export interface ContactFilters {
  account_id?: string;
  status?: string;
  department?: string;
  search?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// State
interface ContactState {
  contacts: Contact[];
  currentContact: Contact | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: ContactFilters;
}

// Actions
type ContactAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONTACTS'; payload: { contacts: Contact[]; pagination: any } }
  | { type: 'SET_CURRENT_CONTACT'; payload: Contact | null }
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'UPDATE_CONTACT'; payload: Contact }
  | { type: 'DELETE_CONTACT'; payload: string }
  | { type: 'SET_FILTERS'; payload: ContactFilters }
  | { type: 'CLEAR_FILTERS' };

// Initial state
const initialState: ContactState = {
  contacts: [],
  currentContact: null,
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
function contactReducer(state: ContactState, action: ContactAction): ContactState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_CONTACTS':
      return {
        ...state,
        contacts: action.payload.contacts,
        pagination: action.payload.pagination,
        isLoading: false,
        error: null,
      };
    case 'SET_CURRENT_CONTACT':
      return { ...state, currentContact: action.payload };
    case 'ADD_CONTACT':
      return {
        ...state,
        contacts: [action.payload, ...state.contacts],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    case 'UPDATE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.map(contact =>
          contact.id === action.payload.id ? action.payload : contact
        ),
        currentContact: state.currentContact?.id === action.payload.id ? action.payload : state.currentContact,
      };
    case 'DELETE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.filter(contact => contact.id !== action.payload),
        currentContact: state.currentContact?.id === action.payload ? null : state.currentContact,
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
interface ContactContextType extends ContactState {
  // CRUD operations
  fetchContacts: (filters?: ContactFilters) => Promise<void>;
  fetchContact: (id: string) => Promise<void>;
  createContact: (data: CreateContactData) => Promise<Contact>;
  updateContact: (id: string, data: UpdateContactData) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  
  // Utility functions
  setFilters: (filters: ContactFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
  clearCurrentContact: () => void;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

// Provider
export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(contactReducer, initialState);
  const apiClient = new ApiClient();

  const fetchContacts = useCallback(async (filters: ContactFilters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const queryParams = new URLSearchParams();
      Object.entries({ ...state.filters, ...filters }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/api/contacts?${queryParams.toString()}`) as { data: any };
      
      dispatch({
        type: 'SET_CONTACTS',
        payload: {
          contacts: (response.data.contacts || response.data) as Contact[],
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
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch contacts' });
      console.error('Error fetching contacts:', error);
    }
  }, [state.filters]);

  const fetchContact = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.get(`/api/contacts/${id}`) as { data: Contact };
      dispatch({ type: 'SET_CURRENT_CONTACT', payload: response.data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch contact' });
      console.error('Error fetching contact:', error);
    }
  }, []);

  const createContact = useCallback(async (data: CreateContactData): Promise<Contact> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.post('/api/contacts', data) as { data: Contact };
      const newContact = response.data;

      dispatch({ type: 'ADD_CONTACT', payload: newContact });
      return newContact;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create contact';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const updateContact = useCallback(async (id: string, data: UpdateContactData): Promise<Contact> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.put(`/api/contacts/${id}`, data) as { data: Contact };
      const updatedContact = response.data;

      dispatch({ type: 'UPDATE_CONTACT', payload: updatedContact });
      return updatedContact;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update contact';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await apiClient.delete(`/api/contacts/${id}`);
      dispatch({ type: 'DELETE_CONTACT', payload: id });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete contact';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const setFilters = useCallback((filters: ContactFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const clearCurrentContact = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_CONTACT', payload: null });
  }, []);

  const value: ContactContextType = {
    ...state,
    fetchContacts,
    fetchContact,
    createContact,
    updateContact,
    deleteContact,
    setFilters,
    clearFilters,
    clearError,
    clearCurrentContact,
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
}

// Hook
export function useContacts() {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
}