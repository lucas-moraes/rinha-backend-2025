import { buildApp } from "./app";
import { CONFIG } from "./config";

async function start() {
  const app = buildApp();
  await app.listen({ port: CONFIG.PORT, host: CONFIG.HOST });
  console.log(`🐎 Rinha rodando na porta ${CONFIG.HOST}:${CONFIG.PORT}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
