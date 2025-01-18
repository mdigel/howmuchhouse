import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { registerRoutes } from './routes';

console.log('Starting server initialization...');

// Initialize express app
const app = express();

// Environment variables and configuration
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Basic middleware setup
console.log('Setting up middleware...');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
if (!isProduction) {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Session-Id');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
}

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Register routes first
console.log('Registering routes...');
const server = registerRoutes(app);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

// Basic error handling middleware (after routes)
app.use((err: Error & { status?: number }, req: Request, res: Response, _next: NextFunction) => {
  console.error(`Error handling ${req.method} ${req.path}:`, err);
  res.status(err.status || 500).json({
    error: isProduction ? 'Internal Server Error' : err.message
  });
});

const startServer = async () => {
  try {
    console.log('Starting HTTP server...');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log('Server initialization complete');
    });

    // Server error handling
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
      console.error('Server error:', error);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

startServer();

export default server;