type TStore = {
  defaultProcessorStatus: { failing: boolean; minResponseTime: number };
  fallbackProcessorStatus: { failing: boolean; minResponseTime: number };
};

class MemoryStore {
  private store: TStore | undefined = undefined;

  public set(data: TStore) {
    this.store = data;
  }

  public get(): TStore | undefined {
    return this.store;
  }
}

export const memoryStore = new MemoryStore();
