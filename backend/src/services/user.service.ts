import { supabase } from '../config/supabase';
import { userSchema, type User } from '../models/schemas';
import { ApiError } from '../utils/errors';

export class UserService {
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      return userSchema.parse(user);
    } catch (error) {
      console.error('Error in createUser:', error);
      throw new ApiError('UserCreationError', 'Failed to create user', error);
    }
  }

  async getUser(userId: string, tenantId: string) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) throw error;
      if (!user) throw new ApiError('UserNotFound', 'User not found');

      return userSchema.parse(user);
    } catch (error) {
      console.error('Error in getUser:', error);
      throw new ApiError('UserFetchError', 'Failed to fetch user', error);
    }
  }

  async listUsers(tenantId: string, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { data: users, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        items: (users ?? []).map((user: unknown) => userSchema.parse(user)),
        total: count ?? 0,
        page,
        pageSize: limit,
        totalPages: count ? Math.ceil(count / limit) : 0
      };
    } catch (error) {
      console.error('Error in listUsers:', error);
      throw new ApiError('UserListError', 'Failed to list users', error);
    }
  }

  async updateUser(userId: string, tenantId: string, updates: Partial<User>) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw error;
      if (!user) throw new ApiError('UserNotFound', 'User not found');

      return userSchema.parse(user);
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw new ApiError('UserUpdateError', 'Failed to update user', error);
    }
  }

  async deleteUser(userId: string, tenantId: string) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
        .eq('tenant_id', tenantId);

      if (error) throw error;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw new ApiError('UserDeletionError', 'Failed to delete user', error);
    }
  }

  async searchUsers(tenantId: string, query: string, limit = 10) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('tenant_id', tenantId)
        .or(`firstName.ilike.%${query}%,lastName.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return (users ?? []).map((user: unknown) => userSchema.parse(user));
    } catch (error) {
      console.error('Error in searchUsers:', error);
      throw new ApiError('UserSearchError', 'Failed to search users', error);
    }
  }
}