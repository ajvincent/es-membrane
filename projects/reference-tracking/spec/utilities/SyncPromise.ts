import SyncPromise, {
  type SyncPromiseResolver
} from "../../source/utilities/SyncPromise.js";

import {
  SyncTaskQueue
} from "../../source/utilities/SyncTaskQueue.js";

describe("SyncPromise", () => {
  it("supports a basic resolve() and .then() pattern", () => {
    const thenCallback = jasmine.createSpy<(value: number) => void>("thenCallback");

    let resolver: SyncPromiseResolver<number> = () => {
      return;
    };
    const promise = new SyncPromise<number>(resolve => {
      resolver = resolve;
    });

    promise.thenNoChain(thenCallback);
    expect(thenCallback).not.toHaveBeenCalled();

    resolver(45);
    expect(thenCallback).toHaveBeenCalledOnceWith(45);

    resolver(67);
    expect(thenCallback).toHaveBeenCalledOnceWith(45);
  });

  it(".withResolver() provides a promise and a resolver", () => {
    const thenCallback = jasmine.createSpy<(value: number) => void>("thenCallback");
    const { promise, resolve } = SyncPromise.withResolver<number>();

    promise.thenNoChain(thenCallback);
    expect(thenCallback).not.toHaveBeenCalled();

    resolve(45);
    expect(thenCallback).toHaveBeenCalledOnceWith(45);

    resolve(67);
    expect(thenCallback).toHaveBeenCalledOnceWith(45);
  });

  it(".all() takes several promises but will not resolve until all are resolved", () => {
    const thenCallback = jasmine.createSpy<(value: readonly number[]) => void>("thenCallback");
    const first = SyncPromise.withResolver<number>();
    const second = SyncPromise.withResolver<number>();
    const third = SyncPromise.withResolver<number>();

    const promise = SyncPromise.all<number>([first.promise, second.promise, third.promise]);
    promise.thenNoChain(thenCallback);
    expect(thenCallback).not.toHaveBeenCalled();

    first.resolve(47);
    expect(thenCallback).not.toHaveBeenCalled();

    third.resolve(67);
    expect(thenCallback).not.toHaveBeenCalled();

    second.resolve(82);

    expect(thenCallback).toHaveBeenCalledTimes(1);
    expect(thenCallback.calls.argsFor(0)).toEqual([[47, 82, 67]]);
  });

  it("integrates well with SyncTaskQueue", () => {
    const queue = new SyncTaskQueue;

    const firstCallback = jasmine.createSpy<(value: number) => void>("first callback");
    const secondCallback = jasmine.createSpy<(value: number) => void>("second callback");
    const allCallback = jasmine.createSpy<(value: readonly number[]) => void>("all callback");

    let firstResolve: SyncPromiseResolver<number> = () => {
      throw new Error("not reachable");
    };
    const firstPromise = new SyncPromise<number>(resolve => {
      firstResolve = resolve;
    }, queue);
    firstPromise.thenNoChain(firstCallback);

    const second = SyncPromise.withResolver<number>(queue);
    second.promise.thenNoChain(secondCallback);

    const allPromise = SyncPromise.all<number>([firstPromise, second.promise], queue);
    allPromise.thenNoChain(allCallback);

    firstResolve(10);
    second.resolve(20);

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).not.toHaveBeenCalled();
    expect(allCallback).not.toHaveBeenCalled();

    for (const task of queue.getTasks()) {
      task();
    }

    expect(firstCallback).toHaveBeenCalledBefore(secondCallback);
    expect(secondCallback).toHaveBeenCalledBefore(allCallback);
    expect(firstCallback).toHaveBeenCalledOnceWith(10);
    expect(secondCallback).toHaveBeenCalledOnceWith(20);
    expect(allCallback).toHaveBeenCalledOnceWith([10, 20]);
  });
});
