export type Processor<T> = (data: T) => Promise<void> | void;

type TQueue = { correlationId: string; amount: number; requestedAt: string };

export class Queue {
  private jobs: Array<TQueue> = [];

  add(data: TQueue) {
    this.jobs.push(data);
  }

  dequeue(): TQueue | undefined {
    if (this.jobs.length === 0) {
      return undefined;
    }
    return this.jobs.shift();
  }

  ItemsInQueue(): number {
    return this.jobs.length;
  }
}

export const queue = new Queue();
