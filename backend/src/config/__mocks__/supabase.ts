// src/config/__mocks__/supabase.ts

interface MockUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tenant_id: string;
  created_at: Date;
  updated_at: Date;
  [key: string]: unknown;
}

interface MockTenant {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  [key: string]: unknown;
}

const mockUsers: Record<string, MockUser> = {};
const mockTenants: Record<string, MockTenant> = {};

const createChainableQuery = (table: string) => {
  let currentResult: unknown[] = [];
  let queryFilter: Record<string, unknown> = {};

  const filterByQuery = (item: Record<string, unknown>) =>
    Object.entries(queryFilter).every(([key, value]) => item[key] === value);

  const query: any = {
    select() {
      // Don't filter here - just prepare the data source
      if (table === 'users') {
        currentResult = Object.values(mockUsers);
      } else if (table === 'tenants') {
        currentResult = Object.values(mockTenants);
      }
      return query;
    },
    insert(data: any) {
      // Handle both object and array input
      const item = Array.isArray(data) ? data[0] : data;
      
      // Check for duplicates if this is a users table and email is provided
      if (table === 'users' && item?.email) {
        const existingUser = Object.values(mockUsers).find((user: any) => user.email === item.email);
        if (existingUser) {
          return {
            select: () => ({
              single: () => Promise.resolve({ 
                data: null, 
                error: new Error('duplicate key value violates unique constraint') 
              }),
            }),
            single: () => Promise.resolve({ 
              data: null, 
              error: new Error('duplicate key value violates unique constraint') 
            }),
          };
        }
      }
      
      const newItem = {
        ...item, // Spread the input data first
        id: item?.id || (table === 'users' ? 'mock-user-id' : 'mock-tenant-id'), // Only set ID if not provided
        created_at: new Date(),
        updated_at: new Date(),
      };
      if (table === 'users') {
        mockUsers[newItem.id] = newItem as MockUser;
      } else if (table === 'tenants') {
        mockTenants[newItem.id] = newItem as MockTenant;
      }
      currentResult = [newItem];
      
      // Return chainable query that properly handles .select().single()
      return {
        select: () => ({
          single: () => Promise.resolve({ data: newItem, error: null }),
        }),
        single: () => Promise.resolve({ data: newItem, error: null }),
      };
    },
    update(data: Record<string, unknown>) {
      if (table === 'users') {
        Object.values(mockUsers).forEach((user: any) => {
          if (filterByQuery(user)) {
            mockUsers[user.id] = { ...user, ...data, updated_at: new Date() };
          }
        });
      }
      return query;
    },
    delete() {
      if (table === 'users') {
        Object.values(mockUsers).filter(filterByQuery).forEach((u: any) => delete mockUsers[u.id]);
      } else if (table === 'tenants') {
        Object.values(mockTenants).filter(filterByQuery).forEach((t: any) => delete mockTenants[t.id]);
      }
      return { error: null };
    },
    eq(col: string, val: unknown) {
      queryFilter = { [col]: val };
      return query;
    },
    match(filters: Record<string, unknown>) {
      queryFilter = filters;
      return query;
    },
    single() {
      // Apply filters here before returning the single result
      let filteredResult = currentResult;
      if (Object.keys(queryFilter).length > 0) {
        filteredResult = (currentResult as Record<string, unknown>[]).filter(filterByQuery);
      }
      
      return Promise.resolve({
        data: filteredResult[0] || null,
        error: filteredResult.length === 0 ? new Error('Not found') : null,
      });
    },
  };

  return query;
};

const supabaseMock = {
  from(table: string) {
    return createChainableQuery(table);
  },
};

module.exports = {
  supabase: supabaseMock,
  default: supabaseMock,
  __esModule: true,
};

// Optional: expose for test control
(global as any).__mockSupabase = {
  mockUsers,
  mockTenants,
  reset: () => {
    // Only clear users between tests. Keep tenants persistent for test suite setup.
    Object.keys(mockUsers).forEach(k => delete mockUsers[k]);
  },
};