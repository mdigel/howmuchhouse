import type { VercelRequest, VercelResponse } from '@vercel/node';

// Setup server once (Vercel may cache this module)
let serverInitialized = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url || '/', 'http://localhost');
  const isCanaryRequest =
    url.searchParams.get('__canary') === '1' ||
    req.headers['x-canary'] === '1';

  if (isCanaryRequest) {
    return res.status(200).json({
      ok: true,
      mode: 'canary',
      message: 'Vercel function executed before Express import',
      env: {
        vercel: process.env.VERCEL ?? null,
        nodeEnv: process.env.NODE_ENV ?? null,
      },
    });
  }

  // Initialize server on first request if needed
  if (!serverInitialized) {
    try {
      const { setupServer } = await import('../server/index');
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

