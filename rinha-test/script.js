import http from "k6/http";
import { check, sleep } from "k6";

export let options = { vus: 50, duration: "30s" };

export default function () {
  const payload = JSON.stringify({ correlationId: `${__VU}-${Date.now()}`, amount: Math.random() * 100 });
  const res = http.post("http://host.docker.internal:9999/payments", payload, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { "status 202": (r) => r.status === 202 });
  sleep(0.1);
}
