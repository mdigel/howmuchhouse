import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Force production mode when deployed
const isProduction = process.env.NODE_ENV === "production" || process.env.REPL_ID != null;
if (isProduction) {
  process.env.NODE_ENV = "production";
}

const app = express();

// Enhanced error handling and logging
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Incoming request`);
  next();
});

// Initialize server
(async () => {
  try {
    console.log('Starting server initialization...');

    // Register routes first
    const server = registerRoutes(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    // Setup environment based on mode
    if (!isProduction) {
      console.log('Setting up development environment...');
      await setupVite(app, server);
    } else {
      console.log('Setting up production environment...');
      serveStatic(app);
    }

    // Start server
    const PORT = Number(process.env.PORT || 5000);
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server started on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
    }).on('error', (error: any) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('Fatal error during server initialization:', error);
    process.exit(1);
  }
})();