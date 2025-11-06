import 'dotenv/config';
import { defineConfig } from "drizzle-kit";

// Prefer discrete PG* vars (work better with Supabase pooler on Windows)
const host = process.env.PGHOST;
const port = process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined;
const database = process.env.PGDATABASE;
const user = process.env.PGUSER;
const password = process.env.PGPASSWORD;
const sslRequired = (process.env.PGSSLMODE || '').toLowerCase() === 'require';

const useObjectCreds = !!(host && port && database && user && password);

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: useObjectCreds
    ? {
      host,
      port: port!,
      database: database!,
      user: user!,
      password: password!,
      // For Supabase external connections
      ssl: sslRequired ? { rejectUnauthorized: false } : undefined,
    }
    : {
      // Fallback to DATABASE_URL
      url: process.env.DATABASE_URL!,
    },
});
