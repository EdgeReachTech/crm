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
const app = express();
const port = process.env.PORT || 3001;


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
import apiRoutes from './routes';

// Apply rate limiter to all routes
app.use('/api', limiter);

// API routes
app.use('/api', apiRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(limiter);

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import leadRoutes from './routes/leads';
import accountRoutes from './routes/accounts';
import contactRoutes from './routes/contacts';
import opportunityRoutes from './routes/opportunities';
import campaignRoutes from './routes/campaigns';

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/opportunities', opportunityRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/campaigns', campaignRoutes);

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

// Start server with error handling
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

export default app;