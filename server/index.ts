import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import path from "path";

const isProduction = process.env.NODE_ENV === "production" || process.env.REPL_ID != null;
if (isProduction) {
  process.env.NODE_ENV = "production";
}

const app = express();

// Enable more detailed logging
const startServer = async () => {
  try {
    console.log("Starting server initialization...");

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Request logging middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // Register routes
    console.log("Registering routes...");
    const server = registerRoutes(app);

    // Error handling middleware
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Server Error:', err);
      res.status(500).json({ error: err.message || "Internal Server Error" });
    });

    // Setup Vite or static files
    if (!isProduction) {
      console.log("Setting up Vite for development...");
      await setupVite(app, server);
    } else {
      console.log("Setting up static file serving for production...");
      // Ensure the dist directory exists before serving
      const distPath = path.join(__dirname, '../dist');
      app.use(express.static(distPath));

      // Serve index.html for all non-API routes
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    // Start the server
    const PORT = Number(process.env.PORT) || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  console.error("Unhandled server startup error:", error);
  process.exit(1);
});