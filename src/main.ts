import { buildApp } from "./app";
import { prisma } from "./domain/index.domain";
import { CONFIG } from "./infra/configs";
import { memoryStore } from "./infra/tools/store.tools";
import { CheckProcessorHealth } from "./presentation/extern-api/index.externapi";

async function start() {
  const app = buildApp();

  await prisma.$connect().then(async () => {
    console.log("✅ Prisma connected successfully");
  });

  await app.listen({ port: CONFIG.PORT, host: CONFIG.HOST });
  console.log(`🐎 Rinha rodando na porta ${CONFIG.HOST}:${CONFIG.PORT}`);
}

setInterval(async () => {
  const resp = await CheckProcessorHealth();

  // console.log(`=> processor`, resp);

  memoryStore.set(resp);
}, 5000);

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
