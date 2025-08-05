import { BuildApp } from "./app";
import { CONFIG } from "./infra/configs";

(async () => {
  const app = BuildApp();
  await app.listen({ port: CONFIG.PORT, host: CONFIG.HOST });
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
