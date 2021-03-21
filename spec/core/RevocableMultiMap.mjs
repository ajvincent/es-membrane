import RevocableMultiMap from "../../source/core/RevocableMultiMap.mjs";
import WeakMultiMap from "../../source/core/utilities/WeakMultiMap.mjs";
import {
  DeadProxyKey
} from "../../source/core/utilities/shared.mjs";

describe("RevocableMultiMap", () => {
  let map;
  beforeEach(() => map = new RevocableMultiMap);

  it("is an instance of WeakMultiMap", () => {
    expect(map).toBeInstanceOf(WeakMultiMap);
  });

  it("can hold a single function", () => {
    const key = {};
    const revoker = jasmine.createSpy("revoker");
    expect(map.set(key, revoker)).toBe(true);

    expect(revoker).not.toHaveBeenCalled();

    const container = map.get(key);
    expect(container).toBeInstanceOf(Set);
    expect(container.size).toBe(1);
    expect(container.has(revoker)).toBe(true);
  });

  it("can hold multiple functions under one key", () => {
    const key = {};
    const voidFunc = () => {};
    map.set(key, voidFunc);

    const revoker = jasmine.createSpy("revoker");
    expect(map.set(key, revoker)).toBe(true);

    expect(revoker).not.toHaveBeenCalled();

    const container = map.get(key);
    expect(container).toBeInstanceOf(Set);
    expect(container.size).toBe(2);
    expect(container.has(voidFunc)).toBe(true);
    expect(container.has(revoker)).toBe(true);
  });

  it("can hold multiple keys", () => {
    const keys = [{}, {}], revoker = jasmine.createSpy("revoker");
    keys.forEach(key => expect(map.set(key, revoker)).toBe(true));

    keys.forEach(key => {
      const container = map.get(key);
      expect(container).toBeInstanceOf(Set);
      expect(container.size).toBe(1);
      expect(container.has(revoker)).toBe(true);
    });

    expect(map.get(keys[0])).not.toBe(map.get(keys[1]));
    expect(revoker).not.toHaveBeenCalled();
  });

  it("does not allow setting a non-function value initially", () => {
    const key = {};
    expect(map.set(key, null)).toBe(false);

    expect(map.has(key)).toBe(false);
  });

  it("does not allow setting a non-function value after setting a value", () => {
    const key = {};
    const revoker = jasmine.createSpy("revoker");
    expect(map.set(key, revoker)).toBe(true);

    expect(revoker).not.toHaveBeenCalled();

    {
      const container = map.get(key);
      expect(container).toBeInstanceOf(Set);
      expect(container.size).toBe(1);
      expect(container.has(revoker)).toBe(true);
    }

    expect(map.set(key, null)).toBe(false);
    expect(revoker).not.toHaveBeenCalled();

    {
      const container = map.get(key);
      expect(container).toBeInstanceOf(Set);
      expect(container.size).toBe(1);
      expect(container.has(revoker)).toBe(true);
    }
  });

  it("delete works as expected for live keys", () => {
    const key = {};
    const voidFunc = () => {};
    map.set(key, voidFunc);

    expect(map.delete(key)).toBe(true);
    expect(map.has(key)).toBe(false);
  });

  it("delete works as expected for unknown keys", () => {
    expect(map.delete({})).toBe(false);
  });

  it("can revoke a key (once)", () => {
    const liveKey = {},
          voidFunc = jasmine.createSpy("voidFunc"),
          deadKey = {},
          revoker1 = jasmine.createSpy("revoker"),
          revoker2 = jasmine.createSpy("revoker");
    map.set(liveKey, voidFunc);
    map.set(deadKey, revoker2);
    map.set(deadKey, revoker1);

    expect(map.revoke(deadKey)).toBe(true);
    expect(revoker1).toHaveBeenCalledTimes(1);
    expect(revoker2).toHaveBeenCalledTimes(1);

    {
      const container = map.get(liveKey);
      expect(container).toBeInstanceOf(Set);
      expect(container.size).toBe(1);
      expect(container.has(voidFunc)).toBe(true);
      expect(voidFunc).toHaveBeenCalledTimes(0);
    }

    expect(map.revoke(deadKey)).toBe(false);
    expect(revoker1).toHaveBeenCalledTimes(1);
    expect(revoker2).toHaveBeenCalledTimes(1);

    {
      const container = map.get(liveKey);
      expect(container).toBeInstanceOf(Set);
      expect(container.size).toBe(1);
      expect(container.has(voidFunc)).toBe(true);
      expect(voidFunc).toHaveBeenCalledTimes(0);
    }
  });

  it("does not mark an unknown key as revoked when calling revoke", () => {
    const key = {},
          revoker0 = jasmine.createSpy("revoker0");
    expect(map.revoke(key)).toBe(false);
    expect(map.has(key)).toBe(false);

    expect(map.set(key, revoker0)).toBe(true);
    expect(revoker0).not.toHaveBeenCalled();
  });

  it("can revoke and report the first exception", () => {
    const key = {},
          revoker0 = jasmine.createSpy("revoker0"),
          revoker1 = jasmine.createSpy("revoker1"),
          revoker2 = jasmine.createSpy("revoker2"),
          revoker3 = jasmine.createSpy("revoker3"),
          returnValue0 = {},
          exception1 = {},
          exception2 = {},
          returnValue3 = {};

    revoker0.and.returnValue(returnValue0);
    revoker1.and.throwError(exception1);
    revoker2.and.throwError(exception2);
    revoker3.and.returnValue(returnValue3);

    map.set(key, revoker0);
    map.set(key, revoker1);
    map.set(key, revoker2);
    map.set(key, revoker3);

    expect(() => map.revoke(key)).toThrow(exception1);
    expect(revoker0).toHaveBeenCalledTimes(1);
    expect(revoker1).toHaveBeenCalledTimes(1);
    expect(revoker2).toHaveBeenCalledTimes(1);
    expect(revoker3).toHaveBeenCalledTimes(1);

    expect(revoker0).toHaveBeenCalledBefore(revoker1);
    expect(revoker1).toHaveBeenCalledBefore(revoker2);
    expect(revoker2).toHaveBeenCalledBefore(revoker3);

    expect(map.revoke(key)).toBe(false);

    expect(revoker0).toHaveBeenCalledTimes(1);
    expect(revoker1).toHaveBeenCalledTimes(1);
    expect(revoker2).toHaveBeenCalledTimes(1);
    expect(revoker3).toHaveBeenCalledTimes(1);
  });

  it("has an unremovable DeadProxyKey for a revoked key's value", () => {
    const key = {},
          voidFunc = () => {};
    map.set(key, voidFunc);
    map.revoke(key);

    const revoker = jasmine.createSpy("revoker");

    expect(map.get(key)).toBe(DeadProxyKey);
    expect(map.delete(key)).toBe(false);
    expect(map.get(key)).toBe(DeadProxyKey);
    expect(map.set(key, revoker)).toBe(false);
    expect(revoker).not.toHaveBeenCalled();
    expect(map.get(key)).toBe(DeadProxyKey);
  });
});
