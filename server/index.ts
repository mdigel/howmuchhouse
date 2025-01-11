import express from "express";
import { createServer } from "http";

const app = express();
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Global error handler (from original code)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
});


try {
  console.log('Starting server initialization...');

  const httpServer = createServer(app);
  const PORT = 5000;

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is now listening on port ${PORT}`);
  });

  httpServer.on('error', (error: Error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('Fatal server error during startup:', error);
  process.exit(1);
}