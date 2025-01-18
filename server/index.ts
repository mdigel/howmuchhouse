import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Force production mode when deployed
const isProduction = process.env.NODE_ENV === "production" || process.env.REPL_ID != null;
if (isProduction) {
  process.env.NODE_ENV = "production";
}

async function createServer() {
  const app = express();

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Logging middleware
  app.use((req, res, next) => {
    if (!req.path.startsWith("/api")) {
      return next();
    }

    const start = Date.now();
    const path = req.path;
    let responseBody: any;

    // Capture JSON response
    const originalJson = res.json;
    res.json = function(body) {
      responseBody = body;
      return originalJson.call(this, body);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      let logMessage = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      if (responseBody) {
        const bodyStr = JSON.stringify(responseBody);
        logMessage += ` :: ${bodyStr.length > 80 ? bodyStr.slice(0, 79) + "…" : bodyStr}`;
      }

      log(logMessage);
    });

    next();
  });

  // Register all routes
  const server = registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    log(`Error: ${err.message}`);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!res.headersSent) {
      res.status(status).json({ message });
    }

    // Log error but don't throw
    console.error(err);
  });

  // Setup vite in development, serve static in production
  if (!isProduction) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
    log("Running in production mode");
  }

  return server;
}

// Simple server start function
async function startServer(server: any) {
  const PORT = parseInt(process.env.PORT || "5000", 10);

  try {
    await new Promise<void>((resolve, reject) => {
      server.listen(PORT, "0.0.0.0", () => {
        log(`Server started on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
        resolve();
      }).on('error', (err: Error) => {
        reject(err);
      });
    });
  } catch (err) {
    log(`Failed to start server on port ${PORT}: ${err}`);
    throw err;
  }
}

// Initialize everything
createServer()
  .then(startServer)
  .catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });