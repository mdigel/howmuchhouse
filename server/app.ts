// IMPORTANT: Load environment variables BEFORE any other imports
import "./config-loader";

import express from "express";
import compression from "compression";
import type { Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import * as path from "path";
import { fileURLToPath } from "url";
import type { Server } from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("Starting server initialization...");
console.log("AI_CHARGE_MODE:", process.env.AI_CHARGE_MODE);

export const app = express();
app.use(compression());

const isProduction =
  process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1";
export const isVercel = process.env.VERCEL === "1";

console.log("Setting up middleware...");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/node_modules/@fontsource/noto-sans",
  express.static(path.resolve(process.cwd(), "node_modules/@fontsource/noto-sans")),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "development-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

if (!isProduction) {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, X-Session-Id",
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}

let seoRoutesPromise: Promise<typeof import("./seo/routes")> | null = null;
let serverSetupPromise: Promise<Server | null> | null = null;

async function getSeoRoutes() {
  seoRoutesPromise ??= import("./seo/routes");
  return seoRoutesPromise;
}

async function configureServer(shouldListen: boolean = true): Promise<Server | null> {
  const server = registerRoutes(app);

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "healthy" });
  });

  const seoRoutePaths = ["/affordability-by-income-level", /^\/\d+k\/[a-z-]+$/];

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (
      seoRoutePaths.some((path) =>
        typeof path === "string" ? req.path === path : path.test(req.path),
      )
    ) {
      void getSeoRoutes()
        .then(({ default: seoRoutes }) => seoRoutes(req, res, next))
        .catch(next);
      return;
    }
    next();
  });

  if (!isProduction && !isVercel) {
    console.log("Setting up Vite in development mode...");
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    console.log("Setting up static file serving in production mode...");
    const publicDir = path.resolve(process.cwd(), "dist/public");
    app.use(express.static(publicDir));

    app.get("*", (req: Request, res: Response, next: NextFunction) => {
      if (
        seoRoutePaths.some((path) =>
          typeof path === "string" ? req.path === path : path.test(req.path),
        )
      ) {
        return next();
      }
      res.sendFile(path.join(publicDir, "index.html"));
    });
  }

  if (shouldListen && !isVercel) {
    const port = Number(process.env.PORT) || 3000;
    console.log("Starting HTTP server...");
    server.listen(port, "0.0.0.0", () => {
      console.log(
        `Server running on port ${port} in ${process.env.NODE_ENV || "development"} mode`,
      );
      console.log("Server initialization complete");
    });

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use`);
        process.exit(1);
      }
      console.error("Server error:", error);
    });
  } else {
    console.log("Server setup complete (Vercel/serverless mode)");
  }

  return server;
}

export function setupServer(shouldListen: boolean = true): Promise<Server | null> {
  if (!serverSetupPromise) {
    console.log("Registering routes...");
    console.log("Registering SEO routes...");
    serverSetupPromise = configureServer(shouldListen);
  }

  return serverSetupPromise;
}

export default app;
