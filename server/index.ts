// IMPORTANT: Load environment variables BEFORE any other imports
import './config-loader';

import express from "express";
import compression from "compression";
import type { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { registerRoutes } from './routes';
import { setupVite } from './vite';
import * as path from 'path';
import { fileURLToPath } from 'url';
import seoRoutes from './seo/routes';
import { createServer, type Server } from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting server initialization...');
console.log('AI_CHARGE_MODE:', process.env.AI_CHARGE_MODE);

// Initialize express app
const app = express();
app.use(compression());

// Environment variables and configuration
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';
const isVercel = process.env.VERCEL === '1';

// Basic middleware setup
console.log('Setting up middleware...');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve font files
app.use('/node_modules/@fontsource/noto-sans', express.static(path.resolve(process.cwd(), 'node_modules/@fontsource/noto-sans')));

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

// Setup server with proper middleware order
export const setupServer = async (shouldListen: boolean = true): Promise<Server | null> => {
  try {
    // Register API routes first
    console.log('Registering routes...');
    const server = registerRoutes(app);

    // Health check endpoint
    app.get('/health', (_req: Request, res: Response) => {
      res.json({ status: 'healthy' });
    });

    // Register SEO routes before any SPA handling
    console.log('Registering SEO routes...');
    const seoRoutePaths = ['/affordability-by-income-level', /^\/\d+k\/[a-z-]+$/];

    // Middleware to handle SEO routes
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Check if the route is a SEO route
      if (seoRoutePaths.some(path => 
          typeof path === 'string' 
            ? req.path === path 
            : path.test(req.path))) {
        return seoRoutes(req, res, next);
      }
      next();
    });

    if (!isProduction && !isVercel) {
      // Development mode: Setup Vite (only for local dev)
      console.log('Setting up Vite in development mode...');
      await setupVite(app, server);
    } else {
      // Production mode: Serve static files
      console.log('Setting up static file serving in production mode...');
      const publicDir = path.resolve(process.cwd(), 'dist/public');
      app.use(express.static(publicDir));

      // Handle SPA routes (but not SEO routes)
      app.get('*', (req: Request, res: Response, next: NextFunction) => {
        // Skip SEO routes
        if (seoRoutePaths.some(path => 
            typeof path === 'string' 
              ? req.path === path 
              : path.test(req.path))) {
          return next();
        }
        res.sendFile(path.join(publicDir, 'index.html'));
      });
    }

    if (shouldListen && !isVercel) {
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
    } else {
      console.log('Server setup complete (Vercel/serverless mode)');
    }

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    if (shouldListen) {
      process.exit(1);
    }
    throw error;
  }
};

// Global error handlers (only for long-running processes)
if (!isVercel) {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    setTimeout(() => process.exit(1), 1000);
  });

  process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
  });
}

// Start server only if not in Vercel environment
if (!isVercel) {
  setupServer();
}

export default app;