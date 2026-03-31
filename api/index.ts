import type { VercelRequest, VercelResponse } from '@vercel/node';
import '../server/config-loader';
import express from 'express';
import { registerApiRoutes } from '../server/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let routesRegistered = false;

function ensureApiRoutesRegistered() {
  if (!routesRegistered) {
    registerApiRoutes(app);
    routesRegistered = true;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url || '/', 'http://localhost');
  const isCanaryRequest =
    url.searchParams.get('__canary') === '1' ||
    req.headers['x-canary'] === '1';
  const checkpoint = url.searchParams.get('__checkpoint');

  if (isCanaryRequest) {
    return res.status(200).json({
      ok: true,
      mode: 'canary',
      message: 'Vercel function executed and loaded minimal API entry',
      env: {
        vercel: process.env.VERCEL ?? null,
        nodeEnv: process.env.NODE_ENV ?? null,
      },
    });
  }

  if (checkpoint === 'import-server') {
    return res.status(200).json({
      ok: true,
      checkpoint,
      message: 'Minimal API entry loaded successfully',
    });
  }

  if (checkpoint === 'setup-server') {
    try {
      ensureApiRoutesRegistered();
      return res.status(200).json({
        ok: true,
        checkpoint,
        message: 'API routes registered successfully',
      });
    } catch (error) {
      console.error('Checkpoint setup-server failed:', error);
      return res.status(500).json({
        ok: false,
        checkpoint,
        error: error instanceof Error ? error.message : 'Unknown setup error',
      });
    }
  }

  ensureApiRoutesRegistered();

  // Log request details for debugging
  console.log('Vercel handler - URL:', req.url, 'Path:', (req as any).path, 'Method:', req.method);

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

