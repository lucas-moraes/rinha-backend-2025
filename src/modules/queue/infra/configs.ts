import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

export const CONFIG = {
  PORT: 9696,
  HOST: process.env.HOST ?? "0.0.0.0",
};
