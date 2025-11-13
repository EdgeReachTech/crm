import { UserRecord } from 'firebase-admin/auth';

// Initialize Mock Firebase User
const mockFirebaseUser = {
  uid: 'mock-uid',
  email: 'test@example.com',
  emailVerified: false,
  disabled: false,
  displayName: null,
  phoneNumber: null,
  photoURL: null,
  customClaims: { role: 'manager', tenant_id: 'mock-tenant-id' },
  metadata: {
    lastSignInTime: null,
    creationTime: new Date().toISOString(),
    lastRefreshTime: null
  },
  providerData: [],
  toJSON: () => ({ uid: 'mock-uid', email: 'test@example.com' })
} as unknown as UserRecord;

// Reset mock state between tests
let currentUser = mockFirebaseUser;
let isValidToken = true;

// Export reset function for tests
export const resetMockState = () => {
  currentUser = mockFirebaseUser;
  isValidToken = true;
};

// Mock implementation
const mockAuthMethods = {
  createUser: jest.fn().mockImplementation(async (userData: { email: string; password: string }) => {
    currentUser = {
      ...mockFirebaseUser,
      email: userData.email
    } as unknown as UserRecord;
    return currentUser;
  }),
  setCustomUserClaims: jest.fn().mockImplementation(async (uid: string, claims: Record<string, unknown>) => {
    currentUser = {
      ...currentUser,
      customClaims: claims
    } as unknown as UserRecord;
  }),
  verifyIdToken: jest.fn().mockImplementation(async (token: string) => {
    if (!isValidToken || token !== 'mock-token') {
      throw new Error('Invalid token');
    }
    return {
      uid: currentUser.uid,
      email: currentUser.email,
      role: currentUser.customClaims?.role || 'user',
      tenant_id: currentUser.customClaims?.tenant_id || 'mock-tenant-id',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
  }),
  getUserByEmail: jest.fn().mockImplementation(async (email: string) => {
    if (email === currentUser.email) {
      return currentUser;
    }
    throw new Error('User not found');
  }),
  updateUser: jest.fn().mockImplementation(async (uid: string, updates: Record<string, unknown>) => {
    currentUser = {
      ...currentUser,
      ...updates
    } as unknown as UserRecord;
    return currentUser;
  })
};

export const auth = () => mockAuthMethods;