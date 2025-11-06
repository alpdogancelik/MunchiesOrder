import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { buildPgConfig } from './pgConfig';

const pgCfg = buildPgConfig();
if (!pgCfg) {
  throw new Error("Database is not configured. Provide PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD (preferred) or DATABASE_URL.");
}

// Create Pool with either connectionString or discrete config
export const pool = new Pool(pgCfg as any);
export const db = drizzle(pool, { schema });