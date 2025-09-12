import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",       // Path to schema
  out: "./db/migrations",         // Where migrations go
  dialect: "postgresql",          // DB type
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Comes from .env
  },
  verbose: true,
  strict: true,
});
