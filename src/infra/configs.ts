import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  PORT: +(process.env.PORT ?? 9999),
  HOST: process.env.HOST!,
  PROCESSOR_DEFAULT: process.env.PROCESSOR_DEFAULT!,
  PROCESSOR_FALLBACK: process.env.PROCESSOR_FALLBACK!,
};
