import express from "express";
import compression from "compression";
import type { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { registerRoutes } from './routes';
import { setupVite, serveStatic } from './vite';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import seoRoutes from './seo/routes';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

console.log('Starting server initialization...');
console.log('AI_CHARGE_MODE:', process.env.AI_CHARGE_MODE);

// Initialize express app
const app = express();
app.use(compression());

// Environment variables and configuration
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';

// Basic middleware setup
console.log('Setting up middleware...');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Setup Vite or static file serving based on environment
const setupServer = async () => {
  try {
    // Register API routes first
    console.log('Registering routes...');
    const server = registerRoutes(app);

    // Health check endpoint
    app.get('/health', (_req: Request, res: Response) => {
      res.json({ status: 'healthy' });
    });

    // Register SEO routes after API routes but before the SPA handling
    console.log('Registering SEO routes...');
    app.use('/', (req: Request, res: Response, next: NextFunction) => {
      // Check if the route is a SEO route
      if (req.path === '/affordability-by-income-level' || 
          /^\/\d+k\/[a-z-]+$/.test(req.path)) {
        seoRoutes(req, res, next);
      } else {
        next();
      }
    });

    if (!isProduction) {
      // Development mode: Setup Vite
      console.log('Setting up Vite in development mode...');
      await setupVite(app, server);
    } else {
      // Production mode: Serve static files
      console.log('Setting up static file serving in production mode...');
      app.use(express.static(path.join(__dirname, '../dist/public')));

      // Handle SPA routes
      app.get('*', (req: Request, res: Response, next: NextFunction) => {
        // Check if it's a SEO route first
        if (req.path === '/affordability-by-income-level' || 
            /^\/\d+k\/[a-z-]+$/.test(req.path)) {
          next();
        } else {
          res.sendFile(path.join(__dirname, '../dist/public/index.html'));
        }
      });
    }

    console.log('Starting HTTP server...');
    server.listen(PORT, '0.0.0.0', () => {
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

setupServer();

export default app;