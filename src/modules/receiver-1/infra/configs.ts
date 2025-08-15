import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

export const CONFIG = {
  PORT: +process.env.PORT!,
  HOST: process.env.HOST ?? "0.0.0.0",
  PROCESSOR_DEFAULT: process.env.PROCESSOR_DEFAULT!,
  PROCESSOR_FALLBACK: process.env.PROCESSOR_FALLBACK!,
};
