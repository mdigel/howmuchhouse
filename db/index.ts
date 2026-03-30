// Load environment variables if not already loaded
import * as dotenv from 'dotenv';
dotenv.config();

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Database features will be unavailable.");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || '',
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

export const db = drizzle(pool, { schema });