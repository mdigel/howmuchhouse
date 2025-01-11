import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Force production mode when deployed
const isProduction = process.env.NODE_ENV === "production" || process.env.REPL_ID != null;
if (isProduction) {
  process.env.NODE_ENV = "production";
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log('Starting server initialization...');
    const server = registerRoutes(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
    });

    // Only setup vite in development
    if (!isProduction) {
      console.log('Setting up Vite for development...');
      await setupVite(app, server);
    } else {
      // In production, serve static files
      console.log('Setting up static file serving for production...');
      serveStatic(app);
      log("Running in production mode");
    }

    // ALWAYS serve the app on port 5000
    const PORT = 5000;
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server is now listening on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
    });

    server.on('error', (error: Error) => {
      console.error('Server failed to start:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('Fatal server error during startup:', error);
    process.exit(1);
  }
})();