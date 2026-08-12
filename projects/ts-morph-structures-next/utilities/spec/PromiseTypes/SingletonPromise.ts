import {
  SingletonPromise
} from "#utilities/source/PromiseTypes.js";

describe("PromiseTypes.SingletonPromise", () => {
  it("resolves to the value we pass in", async () => {
    const expected = {};
    const spy = jasmine.createSpy();
    spy.and.returnValue(Promise.resolve(expected));
    const x = new SingletonPromise<object>(spy);

    await expectAsync(x.run()).toBeResolvedTo(expected);
    expect(spy).toHaveBeenCalledTimes(1);

    await expectAsync(x.run()).toBeResolvedTo(expected);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("rejects with the error we passed in", async () => {
    const expected = {};
    const spy = jasmine.createSpy();
    spy.and.returnValue(Promise.reject(expected));
    const x = new SingletonPromise<object>(spy);

    await expectAsync(x.run()).toBeRejectedWith(expected);
    expect(spy).toHaveBeenCalledTimes(1);

    await expectAsync(x.run()).toBeRejectedWith(expected);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});