// Load environment variables if not already loaded
import * as dotenv from 'dotenv';
dotenv.config();

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Use different schema based on environment
const schemaName = process.env.NODE_ENV === 'production' ? 'production' : 'development';

// Create schema if it doesn't exist
pool.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);

export const db = drizzle(pool, { 
  schema,
  // Set the schema for all queries
  defaultSchema: schemaName 
});