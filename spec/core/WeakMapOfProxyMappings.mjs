import WeakMapOfProxyMappings from "../../source/core/WeakMapOfProxyMappings.mjs";

import {
  DeadProxyKey,
} from "../../source/core/sharedUtilities.mjs";


describe("WeakMapOfProxyMappings", () => {
  let map;
  beforeEach(() => {
   map = new WeakMap;
   WeakMapOfProxyMappings(map);
  });

  it("is itself frozen", () => {
    expect(Object.isFrozen(WeakMapOfProxyMappings)).toBe(true);
  });

  it("only overrides methods of the weak map", () => {
    expect(map.get).toBe(WeakMap.prototype.get);
    expect(map.has).toBe(WeakMap.prototype.has);
    expect(map.set).not.toBe(WeakMap.prototype.set);
    expect(map.delete).toBe(WeakMapOfProxyMappings.delete);
    expect(map.revoke).toBe(WeakMapOfProxyMappings.revoke);
  });


  it("allows setting an ordinary value", () => {
    const key = {};
    const value = {};
    map.set(key, value);
    expect(map.get(key)).toBe(value);
  });

  it("allows revoking a key permanently", () => {
    const key = {};
    const value = {};
    map.set(key, value);
    map.revoke(key);
    expect(map.get(key)).toBe(DeadProxyKey);

    expect(() => {
      map.set(key, value);
    }).toThrowError("WeakMapOfProxyMappings says this key is dead");

    expect(map.get(key)).toBe(DeadProxyKey);
  });
});
