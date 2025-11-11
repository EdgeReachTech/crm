import { supabase } from '../config/supabase';
import { contactSchema, type Contact } from '../models/schemas';
import { ApiError } from '../utils/errors';

export class ContactService {
  async createContact(contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: contact, error } = await supabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single();

      if (error) throw error;
      return contactSchema.parse(contact);
    } catch (error) {
      console.error('Error in createContact:', error);
      throw new ApiError('ContactCreationError', 'Failed to create contact', error);
    }
  }

  async getContact(contactId: string, tenantId: string) {
    try {
      const { data: contact, error } = await supabase
        .from('contacts')
        .select('*, accounts!account_id(*)')
        .eq('id', contactId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) throw error;
      if (!contact) throw new ApiError('ContactNotFound', 'Contact not found');

      return contactSchema.parse(contact);
    } catch (error) {
      console.error('Error in getContact:', error);
      throw new ApiError('ContactFetchError', 'Failed to fetch contact', error);
    }
  }

  async listContacts(tenantId: string, filters: {
    account_id?: string;
    opt_out?: boolean;
    search?: string;
  }, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      let query = supabase
        .from('contacts')
        .select('*, accounts!account_id(*)', { count: 'exact' })
        .eq('tenant_id', tenantId);

      // Apply filters
      if (filters.account_id) {
        query = query.eq('account_id', filters.account_id);
      }
      if (typeof filters.opt_out === 'boolean') {
        query = query.eq('opt_out', filters.opt_out);
      }
      if (filters.search) {
        query = query.or(
          `firstName.ilike.%${filters.search}%,lastName.ilike.%${filters.search}%,email.ilike.%${filters.search}%,role.ilike.%${filters.search}%`
        );
      }

      const { data: contacts, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        items: (contacts ?? []).map((contact: unknown) => contactSchema.parse(contact)),
        total: count ?? 0,
        page,
        pageSize: limit,
        totalPages: count ? Math.ceil(count / limit) : 0
      };
    } catch (error) {
      console.error('Error in listContacts:', error);
      throw new ApiError('ContactListError', 'Failed to list contacts', error);
    }
  }

  async updateContact(contactId: string, tenantId: string, updates: Partial<Contact>) {
    try {
      const { data: contact, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', contactId)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw error;
      if (!contact) throw new ApiError('ContactNotFound', 'Contact not found');

      return contactSchema.parse(contact);
    } catch (error) {
      console.error('Error in updateContact:', error);
      throw new ApiError('ContactUpdateError', 'Failed to update contact', error);
    }
  }

  async deleteContact(contactId: string, tenantId: string) {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)
        .eq('tenant_id', tenantId);

      if (error) throw error;
    } catch (error) {
      console.error('Error in deleteContact:', error);
      throw new ApiError('ContactDeletionError', 'Failed to delete contact', error);
    }
  }

  async updateContactPreferences(contactId: string, tenantId: string, preferences: Contact['preferences']) {
    try {
      const { data: contact, error } = await supabase
        .from('contacts')
        .update({ preferences })
        .eq('id', contactId)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw error;
      if (!contact) throw new ApiError('ContactNotFound', 'Contact not found');

      return contactSchema.parse(contact);
    } catch (error) {
      console.error('Error in updateContactPreferences:', error);
      throw new ApiError('ContactPreferencesUpdateError', 'Failed to update contact preferences', error);
    }
  }

  async updateOptOutStatus(contactId: string, tenantId: string, optOut: boolean) {
    try {
      const { data: contact, error } = await supabase
        .from('contacts')
        .update({ opt_out: optOut })
        .eq('id', contactId)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw error;
      if (!contact) throw new ApiError('ContactNotFound', 'Contact not found');

      return contactSchema.parse(contact);
    } catch (error) {
      console.error('Error in updateOptOutStatus:', error);
      throw new ApiError('ContactOptOutUpdateError', 'Failed to update contact opt-out status', error);
    }
  }
}