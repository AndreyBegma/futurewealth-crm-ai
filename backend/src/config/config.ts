import dotenv from "dotenv";

dotenv.config();

export const nodeEnv = process.env.NODE_ENV || "development";
export const port = process.env.PORT || 4000;

export const database = {
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5433", 10),
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "",
  database: process.env.POSTGRES_DB || "recipe_db",
};

export const jwtSecret = process.env.JWT_SECRET || "sec_key";
export const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
