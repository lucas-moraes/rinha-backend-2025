import { buildApp } from "./app";
import { prisma } from "./domain/index.domain";
import { CONFIG } from "./infra/configs";

async function start() {
  const app = buildApp();

  await prisma.$connect().then(() => {
    console.log("API: ✅ Prisma connected successfully");
  });

  await app.listen({ port: CONFIG.PORT, host: CONFIG.HOST });
  console.log(`API: ✅ Ruuning at port ${CONFIG.HOST}:${CONFIG.PORT}`);
}
start().catch((err) => {
  console.error(err);
  process.exit(1);
});
