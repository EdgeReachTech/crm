// Mock firebase `auth` object to match the real module's exported shape
const auth = {
  createUser: jest.fn().mockImplementation(async (userData: any) => {
    console.log('MOCK: createUser called with:', userData);
    const result = {
      uid: 'mock-uid',
      email: userData.email || 'test@example.com',
    };
    console.log('MOCK: createUser returning:', result);
    return result;
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
      role: 'manager',
      tenant_id: 'mock-tenant-id',
    } as any;
  }),
  getUserByEmail: jest.fn().mockImplementation(async (email: string) => {
    if (email === 'test@example.com') {
      return { uid: 'mock-uid', email, customClaims: { role: 'manager', tenant_id: 'mock-tenant-id' } } as any;
    }
    const err: any = new Error('User not found');
    err.code = 'auth/user-not-found';
    throw err;
  }),
  updateUser: jest.fn().mockResolvedValue({ uid: 'mock-uid' }),
  deleteUser: jest.fn().mockResolvedValue(undefined),
};

// Export as both CommonJS and ES module to be safe
export { auth };
export default { auth };