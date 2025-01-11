import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import { setupVite, serveStatic } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`${req.method} ${req.url} - Started`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });

  next();
});

const httpServer = createServer(app);

// Register API routes first
registerRoutes(app);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

async function startServer() {
  try {
    console.log('Starting server initialization...');
    console.log('Current NODE_ENV:', process.env.NODE_ENV);
    const PORT = 5000;

    if (process.env.NODE_ENV === 'production') {
      // In production, serve the built files
      serveStatic(app);
      console.log('Running in production mode');
    } else {
      // In development, set up Vite's dev server
      console.log('Running in development mode');
      await setupVite(app, httpServer);
    }

    // Add specific error handling for server startup
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('API routes registered and ready');
      console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    });

    httpServer.on('error', (error: Error & { code?: string }) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please free up the port or use a different one.`);
      } else {
        console.error('Server failed to start:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('Fatal server error during startup:', error);
    process.exit(1);
  }
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default httpServer;