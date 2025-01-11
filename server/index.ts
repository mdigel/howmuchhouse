import express from 'express';
import { createServer } from 'http';
import path from 'path';
import calculatorRoutes from './routes/calculator';

const app = express();
const port = Number(process.env.PORT || 5000);

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

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

export default server;