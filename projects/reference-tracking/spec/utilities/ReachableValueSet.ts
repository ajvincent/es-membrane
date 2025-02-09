import ReachableValueSet from "../../source/utilities/ReachableValueSet.js";

describe("ReachableValueSet", () => {
  let valueSet: ReachableValueSet;
  beforeEach(() => valueSet = new ReachableValueSet);

  it("returns false for hasKey until we define a key", () => {
    expect(valueSet.hasKey(14)).toBeFalse();
    valueSet.defineKeyResolver(14, () => undefined);
    expect(valueSet.hasKey(14)).toBeTrue();
  });

  it("allows resolving a single key simply", () => {
    const zeroCallback = jasmine.createSpy<() => void>("zeroCallback");
    valueSet.defineKeyResolver(0, zeroCallback);

    expect(valueSet.isKeyResolved(0)).toBeFalse();
    expect(zeroCallback).not.toHaveBeenCalled();

    valueSet.resolveKey(0);
    expect(zeroCallback).toHaveBeenCalledTimes(1);
    expect(valueSet.isKeyResolved(0)).toBeTrue();
    expect(valueSet.hasKey(0)).toBeTrue();

    // no penalty for resolving more than once
    valueSet.resolveKey(0);
    expect(zeroCallback).toHaveBeenCalledTimes(1);
    expect(valueSet.isKeyResolved(0)).toBeTrue();
    expect(valueSet.hasKey(0)).toBeTrue();
  });

  it("auto-resolves a key based on a completed set of other keys resolving", () => {
    const callbacks: jasmine.Spy<() => void>[] = [];
    for (let index = 0; index <= 3; index++) {
      const spy = jasmine.createSpy<() => void>("callback " + index);
      valueSet.defineKeyResolver(index, spy);
      callbacks.push(spy);
    }

    valueSet.keyDependsOnJointOwners(0, [1, 2, 3]);
    expect(valueSet.hasKey(0)).toBeTrue();
    expect(valueSet.hasKey(1)).toBeTrue();
    expect(valueSet.hasKey(2)).toBeTrue();
    expect(valueSet.hasKey(3)).toBeTrue();

    expect(valueSet.isKeyResolved(0)).toBeFalse();
    expect(valueSet.isKeyResolved(1)).toBeFalse();
    expect(valueSet.isKeyResolved(2)).toBeFalse();
    expect(valueSet.isKeyResolved(3)).toBeFalse();

    valueSet.resolveKey(1);
    expect(valueSet.isKeyResolved(0)).toBeFalse();
    expect(valueSet.isKeyResolved(1)).toBeTrue();
    expect(valueSet.isKeyResolved(2)).toBeFalse();
    expect(valueSet.isKeyResolved(3)).toBeFalse();

    valueSet.resolveKey(3);
    expect(valueSet.isKeyResolved(0)).toBeFalse();
    expect(valueSet.isKeyResolved(1)).toBeTrue();
    expect(valueSet.isKeyResolved(2)).toBeFalse();
    expect(valueSet.isKeyResolved(3)).toBeTrue();

    expect(callbacks[0]).toHaveBeenCalledTimes(0);

    valueSet.resolveKey(2);
    expect(valueSet.isKeyResolved(0)).toBeTrue();
    expect(valueSet.isKeyResolved(1)).toBeTrue();
    expect(valueSet.isKeyResolved(2)).toBeTrue();
    expect(valueSet.isKeyResolved(3)).toBeTrue();
    expect(callbacks[0]).toHaveBeenCalledTimes(1);
  });

  it("auto-resolves a key based on any set of other keys resolving", () => {
    const callbacks: (() => void)[] = [];
    for (let index = 0; index <= 2; index++) {
      const spy = function() {
        // empty on purpose
      }
      valueSet.defineKeyResolver(index, spy);
      callbacks.push(spy);
    }

    valueSet.keyDependsOnJointOwners(0, [1]);
    valueSet.keyDependsOnJointOwners(0, [2]);
    expect(valueSet.isKeyResolved(0)).toBeFalse();
    expect(valueSet.isKeyResolved(1)).toBeFalse();
    expect(valueSet.isKeyResolved(2)).toBeFalse();

    valueSet.resolveKey(2);
    expect(valueSet.isKeyResolved(0)).toBeTrue();
    expect(valueSet.isKeyResolved(1)).toBeFalse();
    expect(valueSet.isKeyResolved(2)).toBeTrue();
  });

  it("invokes an optional callback when any set of owner keys resolves", () => {
    const callbacks: (() => void)[] = [];
    for (let index = 0; index <= 3; index++) {
      const spy = function() {
        // empty on purpose
      }
      valueSet.defineKeyResolver(index, spy);
      callbacks.push(spy);
    }

    const ownersResolved = jasmine.createSpy<
      (childKey: number, jointOwnerKeys: readonly number[]) => void
    >("ownersResolved");

    const jointKeys = [1, 2, 3];
    valueSet.keyDependsOnJointOwners(0, jointKeys, ownersResolved);

    jointKeys.pop();

    valueSet.resolveKey(1);
    valueSet.resolveKey(3);

    expect(ownersResolved).toHaveBeenCalledTimes(0);
    valueSet.resolveKey(2);

    expect(ownersResolved).toHaveBeenCalledOnceWith(0, [1, 2, 3]);

    valueSet.resolveKey(1);
    valueSet.resolveKey(2);
    valueSet.resolveKey(3);
    expect(ownersResolved).toHaveBeenCalledOnceWith(0, [1, 2, 3]);
  });

  it("requires defining a key resolver first for each key", () => {
    expect(
      () => valueSet.keyDependsOnJointOwners(14, [6, 12])
    ).toThrowError("no reachable value defined for owner key 6");

    valueSet.defineKeyResolver(6, () => undefined);
    expect(
      () => valueSet.keyDependsOnJointOwners(14, [6, 12])
    ).toThrowError("no reachable value defined for owner key 12");

    valueSet.defineKeyResolver(12, () => undefined);
    expect(
      () => valueSet.keyDependsOnJointOwners(14, [6, 12])
    ).toThrowError("no reachable value defined for child key 14");

    expect(
      () => valueSet.isKeyResolved(3)
    ).toThrowError("no reachable value found for key 3");

    expect(
      () => valueSet.resolveKey(2)
    ).toThrowError("no reachable value found for key 2");
  });

  it("throws on defining a key twice", () => {
    valueSet.defineKeyResolver(0, () => undefined);
    expect(
      () => valueSet.defineKeyResolver(0, () => undefined)
    ).toThrowError("reachable value already defined for key 0");
  });
});
