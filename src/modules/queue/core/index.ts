interface IPayment {
  correlationId: string;
  amount: number;
  requestedAt: Date;
  processedAt: Date | null;
  provider: string | null;
  divisor: number;
}

export class Queue {
  private jobs: Array<IPayment> = [];

  enqueue(data: IPayment) {
    this.jobs.push(data);
  }

  dequeue(divisor: number): IPayment | undefined {
    if (this.jobs.length === 0) {
      return undefined;
    }
    const idx = this.jobs.findIndex((job) => job.divisor === divisor);
    if (idx === -1) {
      return undefined;
    }
    const [task] = this.jobs.splice(idx, 1);
    return task;
  }

  ItemsInQueue(): number {
    return this.jobs.length;
  }
}

export const queue = new Queue();
