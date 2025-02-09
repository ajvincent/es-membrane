import SyncPromise, {
  type SyncPromiseResolver
} from "../../source/utilities/SyncPromise.js";

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
});
