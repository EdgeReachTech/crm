declare namespace Express {
  export interface Request {
    user?: {
      uid: string;
      email?: string;
      role?: 'manager' | 'sales_rep';
      tenant_id?: string;
    };
    tenant: {
      id: string;
      name: string;
      settings?: Record<string, any>;
    };
  }
}