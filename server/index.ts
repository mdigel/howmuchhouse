import express from 'express';
import { createServer } from 'http';
import { setupVite, serveStatic } from './vite.js';
import calculatorRoutes from './routes/calculator.js';

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT || 3000); // Changed to port 3000

  // Basic middleware setup
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Basic logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Mount calculator routes
  app.use('/api', calculatorRoutes);

  // Test endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message
    });
  });

  const server = createServer(app);

  try {
    // Set up Vite or static file serving based on environment
    if (process.env.NODE_ENV === 'production') {
      serveStatic(app);
    } else {
      await setupVite(app, server);
    }

    await new Promise<void>((resolve, reject) => {
      server.listen(port, '0.0.0.0', () => {
        console.log(`Server started on port ${port}`);
        resolve();
      }).on('error', (error) => {
        console.error('Server startup error:', error);
        reject(error);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }

  return server;
}

// Start the server
startServer().catch(error => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

export default startServer;