import axios from "axios";
import { CONFIG } from "../config";

interface Health {
  healthy: boolean;
  latency: number;
}

export class HealthService {
  private default: Health = { healthy: true, latency: Infinity };
  private fallback: Health = { healthy: true, latency: Infinity };

  constructor() {
    setInterval(() => this.poll(), 5000);
  }

  private async pollOne(url: string): Promise<Health> {
    const start = Date.now();
    try {
      const resp = await axios.get(url + "/payments/service-health");
      if (!resp.data.failling) {
        return { healthy: true, latency: Date.now() - start };
      }
      return { healthy: false, latency: Date.now() - start };
    } catch {
      return { healthy: false, latency: Infinity };
    }
  }

  private async poll() {
    this.default = await this.pollOne(CONFIG.PROCESSOR_DEFAULT);
    this.fallback = await this.pollOne(CONFIG.PROCESSOR_FALLBACK);
  }

  getHealth() {
    return { default: this.default, fallback: this.fallback };
  }
}
