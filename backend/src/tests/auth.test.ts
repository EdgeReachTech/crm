// src/tests/auth.test.ts

// Mock the Firebase module before any imports
jest.doMock('../config/firebase', () => ({
  auth: {
    createUser: jest.fn().mockImplementation(async (userData: any) => {
      console.log('MOCK: createUser called with:', userData);
      return {
        uid: 'mock-uid',
        email: userData.email || 'test@example.com',
      };
    }),
    setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
    verifyIdToken: jest.fn().mockImplementation(async (token: string) => {
      if (token !== 'mock-token') {
        const err: any = new Error('Invalid token');
        err.code = 'auth/argument-error';
        throw err;
      }
      return {
        uid: 'mock-uid',
        email: 'test@example.com',
        role: 'admin',
        tenant_id: 'mock-tenant-id',
      } as any;
    }),
    getUserByEmail: jest.fn().mockImplementation(async (email: string) => {
      if (email === 'test@example.com') {
        return { uid: 'mock-uid', email, customClaims: { role: 'admin', tenant_id: 'mock-tenant-id' } } as any;
      }
      const err: any = new Error('User not found');
      err.code = 'auth/user-not-found';
      throw err;
    }),
    updateUser: jest.fn().mockResolvedValue({ uid: 'mock-uid' }),
    deleteUser: jest.fn().mockResolvedValue(undefined),
  }
}));

// Ensure Jest uses our manual mocks from src/config/__mocks__
jest.doMock('../config/supabase');

// Use require() after jest.mock so the manual mocks are picked up reliably
const request = require('supertest');
const { app } = require('../app');
// normalize CommonJS/ESM shapes from the mocks
const _supabaseMod = require('../config/supabase');
const supabase = _supabaseMod.supabase || _supabaseMod.default || _supabaseMod;

// Access mock state for control and debugging
const mockSupabase = (global as any).__mockSupabase;

function resetMockState() {
  mockSupabase?.reset?.();
  jest.clearAllMocks();
}

describe('Sanity Check', () => {
  it('should run a basic test', () => {
    expect(true).toBe(true);
  });
});

describe('Authentication Flow', () => {
  let tenantId: string;
  let userToken = 'mock-token'; // Firebase mock returns this for valid token
  let userId: string;

  const testUser = {
    email: 'test@example.com',
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin',
  };

  beforeEach(() => {
    resetMockState();
  });

  beforeAll(async () => {
    // Instead of calling the supabase mock's chainable API (which can be brittle in this
    // test environment), insert a tenant directly into the mock state exposed as
    // global.__mockSupabase. This avoids intermittent shape/mocking issues.
    const mockState = (global as any).__mockSupabase;
    const tenant = {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Test Company',
      created_at: new Date(),
      updated_at: new Date(),
    };
    if (mockState && mockState.mockTenants) {
      mockState.mockTenants[tenant.id] = tenant;
    }
    tenantId = tenant.id;
  });

  afterAll(() => {
    resetMockState();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          first_name: testUser.firstName,
          last_name: testUser.lastName,
          role: testUser.role,
          tenant_id: tenantId,
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.role).toBe(testUser.role);
      expect(response.body.data.tenant_id).toBe(tenantId);

      userId = response.body.data.id;
    });

    it('should not register user with existing email', async () => {
      // First registration (should succeed)
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123!',
          first_name: 'Dup',
          last_name: 'User',
          role: 'sales_rep',
          tenant_id: tenantId,
        });

      // Second attempt with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123!',
          first_name: 'Dup',
          last_name: 'User',
          role: 'sales_rep',
          tenant_id: tenantId,
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('USER_EXISTS');
    });

    it('should not register user with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
          role: 'user',
          tenant_id: tenantId,
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Ensure user exists in Supabase mock
      await supabase
        .from('users')
        .insert([
          {
            id: 'mock-uid',
            email: testUser.email,
            first_name: testUser.firstName,
            last_name: testUser.lastName,
            role: testUser.role,
            tenant_id: tenantId,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('Protected Routes & Role Authorization', () => {
    beforeEach(async () => {
      userToken = 'mock-token'; // Firebase mock accepts this
      
      // Ensure user exists in Supabase mock for auth middleware
      await supabase
        .from('users')
        .insert([
          {
            id: 'mock-uid',
            email: testUser.email,
            first_name: testUser.firstName,
            last_name: testUser.lastName,
            role: testUser.role,
            tenant_id: tenantId,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);
    });

    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.email).toBe(testUser.email);
    });

    it('should not access protected route without token', async () => {
      const response = await request(app).get('/api/v1/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('AUTH_HEADER_INVALID');
    });

    it('should not access protected route with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('TOKEN_INVALID');
    });

    it('should update user role as admin', async () => {
      const response = await request(app)
        .patch('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          role: 'manager',
        });

      console.log('Update role response status:', response.status);
      console.log('Update role response body:', response.body);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.role).toBe('manager');
    });
  });

  describe('Password Reset Flow', () => {
    it('should request password reset', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password-request')
        .send({
          email: testUser.email,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should not request reset for non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password-request')
        .send({
          email: 'nonexistent@example.com',
        });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('USER_NOT_FOUND');
    });

    it('should reset password with valid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'reset_valid-reset-token',
          newPassword: 'newPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should not reset password with invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'reset_invalid-token',
          newPassword: 'newPassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('TOKEN_INVALID');
    });
  });
});