import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

console.log("Starting server initialization...");

const isProduction = process.env.NODE_ENV === "production" || process.env.REPL_ID != null;
if (isProduction) {
  process.env.NODE_ENV = "production";
  console.log("Running in production mode");
} else {
  console.log("Running in development mode");
}

const app = express();

// Basic middleware setup
try {
  console.log("Setting up middleware...");
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
} catch (error) {
  console.error("Error setting up basic middleware:", error);
  throw error;
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  console.log(`Incoming request: ${req.method} ${path}`);

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
    console.log("Registering routes...");
    const server = registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Server error:", err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    console.log("Setting up Vite/Static serving...");
    if (!isProduction) {
      await setupVite(app, server);
      console.log("Vite setup completed");
    } else {
      serveStatic(app);
      console.log("Static serving setup completed");
    }

    // ALWAYS serve the app on port 5000
    const PORT = 5000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
    });

  } catch (error) {
    console.error("Fatal server error during startup:", error);
    process.exit(1);
  }
})();