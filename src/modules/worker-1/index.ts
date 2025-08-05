import { memoryStore } from "./store/index.store";
import { CheckProcessorHealth } from "./foreign/api-process-health.foreign";
import { ProcessmentApplication } from "./application/processment.application";

class Worker {
  constructor() {
    this.runProcessorHealthCheck();
    this.startWorker();
  }

  private async runProcessorHealthCheck(): Promise<void> {
    try {
      const response = await CheckProcessorHealth.checkHealth();

      memoryStore.set(response);

      setInterval(async () => {
        const response = await CheckProcessorHealth.checkHealth();
        memoryStore.set(response);
      }, 5000);
    } catch (error) {
      process.exit(1);
    }
  }

  private async startWorker(): Promise<void> {
    new ProcessmentApplication();
  }
}

new Worker();
