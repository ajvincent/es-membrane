export class SyncTaskQueue {
  readonly #callbacks: (() => void)[] = [];

  public addTask(callback: () => void): void {
    this.#callbacks.push(callback);
  }

  public * getTasks(): Iterable<(() => void)> {
    while (this.#callbacks.length) {
      yield this.#callbacks.shift()!;
    }
  }
}
