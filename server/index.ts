import express from "express";
import { registerRoutes } from "./routes";

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Basic middleware
app.use(express.json());

// Register all routes
const server = registerRoutes(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});