import dotenv from "dotenv";
import { Pool } from "pg";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

export const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT),
  max: 10,
});
