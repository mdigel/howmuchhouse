import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { registerRoutes } from './routes';
import path from 'path';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'dist')));
}

// Register API routes (this contains all the existing endpoints)
const server = registerRoutes(app);

// Global error handler - keep it simple
app.use((err: Error & { status?: number }, req: Request, res: Response, _next: NextFunction) => {
  console.error(`Error handling ${req.method} ${req.path}:`, err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start server with basic error handling
const startServer = () => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

startServer();

export default server;