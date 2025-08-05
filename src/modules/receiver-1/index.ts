import { buildApp } from "./app";
import { CONFIG } from "./infra/configs";

(async () => {
  const app = buildApp();
  await app.listen({ port: CONFIG.PORT, host: CONFIG.HOST });
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
