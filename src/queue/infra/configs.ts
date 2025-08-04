import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  PORT: 9696,
  HOST: process.env.HOST ?? "0.0.0.0",
};
