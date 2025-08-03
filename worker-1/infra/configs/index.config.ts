import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  PROCESSOR_DEFAULT: process.env.PROCESSOR_DEFAULT!,
  PROCESSOR_FALLBACK: process.env.PROCESSOR_FALLBACK!,
};
