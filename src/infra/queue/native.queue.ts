export type Processor<T> = (data: T) => Promise<void> | void;

export class Queue<T> {
  private jobs: Array<{ data: T; resolve: () => void; reject: (e: any) => void }> = [];
  private running = 0;

  constructor(
    private readonly processor: Processor<T>,
    private readonly concurrency: number = 1,
  ) {}

  async add(data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      this.jobs.push({ data, resolve, reject });
      this.dequeue();
    });
  }

  private dequeue(): void {
    while (this.running < this.concurrency && this.jobs.length > 0) {
      const job = this.jobs.shift()!;
      this.running++;
      Promise.resolve(this.processor(job.data))
        .then(() => {
          job.resolve();
        })
        .catch((e) => {
          job.reject(e);
        })
        .finally(() => {
          this.running--;
          this.dequeue();
        });
    }
  }
}
