import WeakMultiMap from "../../source/core/WeakMultiMap.mjs";

describe("WeakMultiMap", () => {
  const map = new WeakMultiMap();

  it("is an instance of WeakMap", () => {
    expect(map).toBeInstanceOf(WeakMap);
  });

  it("can hold a single value", () => {
    const key = {}, value = {};
    expect(map.set(key, value)).toBe(map);

    const container = map.get(key);
    expect(container).toBeInstanceOf(Set);
    expect(container.size).toBe(1);
    expect(container.has(value)).toBe(true);
  });

  it("can hold multiple values", () => {
    const key = {}, values = [{}, {}, {}];
    values.forEach(value => expect(map.set(key, value)).toBe(map));

    const container = map.get(key);
    expect(container).toBeInstanceOf(Set);
    expect(container.size).toBe(3);
    values.forEach(value => expect(container.has(value)).toBe(true));
  });

  it("can hold multiple keys", () => {
    const keys = [{}, {}], value = {};
    keys.forEach(key => expect(map.set(key, value)).toBe(map));

    keys.forEach(key => {
      const container = map.get(key);
      expect(container).toBeInstanceOf(Set);
      expect(container.size).toBe(1);
      expect(container.has(value)).toBe(true);
    });

    expect(map.get(keys[0])).not.toBe(map.get(keys[1]));
  });
});
