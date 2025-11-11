import { supabase } from '../config/supabase';
import { Account } from '../models/schemas';
import { DatabaseError } from '../utils/errors';

export class AccountService {
  async create(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert(account)
        .select()
        .single();

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async get(id: string, includeRelations = false) {
    try {
      let query = supabase.from('accounts').select();
      
      if (includeRelations) {
        query = query.select(`
          *,
          contacts:contacts(*),
          opportunities:opportunities(*),
          child_accounts:accounts(*)
        `).eq('id', id);
      } else {
        query = query.select().eq('id', id);
      }

      const { data, error } = await query.single();

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async list(params: {
    page?: number;
    limit?: number;
    search?: string;
    owner_id?: string;
    industry?: string;
    size?: Account['size'];
    includeRelations?: boolean;
  }) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        owner_id,
        industry,
        size,
        includeRelations = false
      } = params;

      let query = supabase.from('accounts');

      if (includeRelations) {
        query = query.select(`
          *,
          contacts:contacts(id, name),
          opportunities:opportunities(id, name, value)
        `, { count: 'exact' });
      } else {
        query = query.select('*', { count: 'exact' });
      }

      // Apply filters
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      if (owner_id) {
        query = query.eq('owner_id', owner_id);
      }
      if (industry) {
        query = query.eq('industry', industry);
      }
      if (size) {
        query = query.eq('size', size);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw new DatabaseError(error.message);

      return {
        data,
        count: count || 0,
        page,
        limit
      };
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, account: Partial<Omit<Account, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update(account)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string) {
    try {
      // First check for child accounts and related records
      const { data: childAccounts, error: childError } = await supabase
        .from('accounts')
        .select('id')
        .eq('parent_account_id', id);

      if (childError) throw new DatabaseError(childError.message);
      if (childAccounts?.length > 0) {
        throw new Error('Cannot delete account with child accounts. Please delete or reassign child accounts first.');
      }

      // Delete the account
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw new DatabaseError(error.message);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getHierarchy(id: string) {
    try {
      // Using a recursive CTE to get the full account hierarchy
      const { data, error } = await supabase.rpc('get_account_hierarchy', {
        root_id: id
      });

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      throw error;
    }
  }
}