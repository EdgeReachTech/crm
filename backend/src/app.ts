import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { config } from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import * as swaggerDocument from './swagger-output.json';
import { ApiError } from './types/api';

// Load environment variables
config();

// Initialize Express app
export const app = express();

// Security Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import leadRoutes from './routes/leads';
import accountRoutes from './routes/accounts';
import contactRoutes from './routes/contacts';
import opportunityRoutes from './routes/opportunities';
import campaignRoutes from './routes/campaigns';

// Apply rate limiter to all routes
app.use('/api', limiter);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/opportunities', opportunityRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/campaigns', campaignRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Standard welcome page for root
app.get('/', (_req: Request, res: Response) => {
  res.status(200).send(`
    <html>
      <head>
        <title>EdgeReach CRM Backend</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f8f9fa; color: #222; text-align: center; padding-top: 10vh; }
          h1 { color: #007bff; }
          p { font-size: 1.2em; }
        </style>
      </head>
      <body>
        <h1>Welcome to EdgeReach CRM Backend</h1>
        <p>The API is running successfully.</p>
        <p>See <a href="/api-docs">Swagger Docs</a> for API documentation.</p>
      </body>
    </html>
  `);
});
// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.use('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Global error handling middleware
app.use((err: Error | ApiError, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  
  if ('code' in err) {
    // Handle known API errors
    const apiError = err as ApiError;
    res.status(400).json({
      success: false,
      error: apiError.code,
      message: apiError.message,
      details: apiError.details
    });
  } else {
    // Handle unexpected errors
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred'
        : err.message
    });
  }
});