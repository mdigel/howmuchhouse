import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setupServer } from '../server/index';

// Setup server once (Vercel may cache this module)
let serverInitialized = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize server on first request if needed
  if (!serverInitialized) {
    try {
      await setupServer(false); // false = don't listen on a port
      serverInitialized = true;
    } catch (error) {
      console.error('Failed to initialize server:', error);
      return res.status(500).json({ error: 'Server initialization failed' });
    }
  }

  // Log request details for debugging
  console.log('Vercel handler - URL:', req.url, 'Path:', (req as any).path, 'Method:', req.method);
  
  // Import app after setup
  const { default: app } = await import('../server/index');
  
  // Convert Vercel request/response to Express format
  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err?: any) => {
      if (err) {
        console.error('Express handler error:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

