import express from "express";
import { registerRoutes } from "./routes";
import cors from "cors";
import http from 'http';

// Force production mode when deployed
const isProduction = process.env.NODE_ENV === "production" || process.env.REPL_ID != null;
if (isProduction) {
  process.env.NODE_ENV = "production";
}

function createServer() {
  const app = express();
  const server = http.createServer(app);

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors());

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: isProduction ? "An unexpected error occurred" : err.message
    });
  });

  // Register API routes
  registerRoutes(app);

  // Static file serving in production
  if (isProduction) {
    app.use(express.static('dist/public'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/public/index.html', { root: '.' });
    });
  }

  return { app, server };
}

// Start server
let server: http.Server;

async function startServer() {
  try {
    const PORT = process.env.PORT || 5000;
    const { app, server: httpServer } = createServer();
    server = httpServer;

    await new Promise<void>((resolve, reject) => {
      server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
        resolve();
      }).on('error', (error) => {
        reject(error);
      });
    });

    // Handle cleanup
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { server };