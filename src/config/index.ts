import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  PORT: +(process.env.PORT ?? 9999),
  HOST: process.env.HOST!,
  DB_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL!,
  PROCESSOR_DEFAULT: process.env.PROCESSOR_DEFAULT!,
  PROCESSOR_FALLBACK: process.env.PROCESSOR_FALLBACK!,
};
