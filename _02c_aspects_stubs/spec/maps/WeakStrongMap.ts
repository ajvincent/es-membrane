import holdsArgument from "#stage_utilities/source/gc/holdsArgument.mjs";

import WeakStrongMap from "#aspects/stubs/source/maps/WeakStrongMap.js";

describe("CodeGenerator(WeakStrongMap.mjs),", () => {
  let testMap: WeakStrongMap<object, unknown, unknown>, refMap = new Map;

  const defaultValue1 = Symbol("default value one");
  const defaultGetter1 = () => defaultValue1;
  const defaultValue2 = Symbol("default value two");
  const defaultGetter2 = () => defaultValue2;

  beforeEach(() => {
    refMap.clear();
    testMap = new WeakStrongMap();
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(WeakStrongMap)).toBe(true);
    expect(Object.isFrozen(WeakStrongMap.prototype)).toBe(true);
  });

  it("instances stringify to a string with the className", () => {
    expect(testMap.toString().includes("WeakStrongMap")).toBe(true);
  });

  it("setting one value", () => {
    const key1 = {isKey1: true}, key2 = {isKey2: true}, value = "value";
    refMap.set(key1, value);

    expect(testMap.set(key1, key2, value)).toBe(testMap);
    expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key2)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key1, key2, defaultGetter1)).toBe(refMap.get(key1));

    expect(testMap.delete(key1, key2)).toBe(true);
    expect(testMap.delete(key1, key2)).toBe(false);

    expect(testMap.set(key1, key2, value)).toBe(testMap);
    expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key2)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key1, key2, defaultGetter1)).toBe(refMap.get(key1));
  });

  it("setting two values with a constant second key", () => {
    const key1 = {isKey1: true}, key3 = {isKey3: true}, value1 = "value1";
    refMap.set(key1, value1);
    const key2 = {isKey2: true}, value2 = "value3";
    refMap.set(key2, value2);

    expect(testMap.set(key1, key3, value1)).toBe(testMap);
    expect(testMap.has(key1, key3)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key3)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key1, key3, defaultGetter1)).toBe(refMap.get(key1));

    expect(testMap.set(key2, key3, value2)).toBe(testMap);
    expect(testMap.has(key2, key3)).toBe(refMap.has(key2));
    expect(testMap.get(key2, key3)).toBe(refMap.get(key2));
    expect(testMap.getDefault(key2, key3, defaultGetter1)).toBe(refMap.get(key2));

    expect(testMap.delete(key1, key3)).toBe(true);
    expect(testMap.delete(key1, key3)).toBe(false);

    refMap.delete(key1);
    refMap.set(key1, value1);

    expect(testMap.set(key1, key3, value1)).toBe(testMap);
    expect(testMap.has(key1, key3)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key3)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key1, key3, defaultGetter1)).toBe(refMap.get(key1));
  });

  it("setting two values with a constant first key", () => {
    const key1 = {isKey1: true}, key3 = {isKey3: true}, value1 = "value1";
    refMap.set(key1, value1);
    const key2 = {isKey2: true}, value2 = "value3";
    refMap.set(key2, value2);

    expect(testMap.set(key3, key1, value1)).toBe(testMap);
    expect(testMap.has(key3, key1)).toBe(refMap.has(key1));
    expect(testMap.get(key3, key1)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key3, key1, defaultGetter1)).toBe(refMap.get(key1));

    expect(testMap.set(key3, key2, value2)).toBe(testMap);
    expect(testMap.has(key3, key2)).toBe(refMap.has(key2));
    expect(testMap.get(key3, key2)).toBe(refMap.get(key2));
    expect(testMap.getDefault(key3, key2, defaultGetter1)).toBe(refMap.get(key2));

    expect(testMap.delete(key3, key1)).toBe(true);
    expect(testMap.delete(key3, key1)).toBe(false);

    refMap.delete(key1);
    refMap.set(key1, value1);

    expect(testMap.set(key3, key1, value1)).toBe(testMap);
    expect(testMap.has(key3, key1)).toBe(refMap.has(key1));
    expect(testMap.get(key3, key1)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key3, key1, defaultGetter1)).toBe(refMap.get(key1));
  });

  it("setting two values with swapping keys", () => {
    const key1 = {isKey1: true}, value1 = "value1";
    refMap.set(key1, value1);
    const key2 = {isKey2: true}, value2 = "value3";
    refMap.set(key2, value2);

    expect(testMap.set(key1, key2, value1)).toBe(testMap);
    expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key2)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key1, key2, defaultGetter1)).toBe(refMap.get(key1));

    expect(testMap.set(key2, key1, value2)).toBe(testMap);
    expect(testMap.has(key2, key1)).toBe(refMap.has(key2));
    expect(testMap.get(key2, key1)).toBe(refMap.get(key2));
    expect(testMap.getDefault(key2, key1, defaultGetter1)).toBe(refMap.get(key2));

    expect(testMap.delete(key1, key2)).toBe(true);
    expect(testMap.delete(key1, key2)).toBe(false);

    refMap.delete(key1);
    refMap.set(key1, value1);

    expect(testMap.set(key1, key2, value1)).toBe(testMap);
    expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key2)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key1, key2, defaultGetter1)).toBe(refMap.get(key1));
  });

  it("calling .getDefault() returns default values for undefined key sets", () => {
    const key1 = {isKey1: true}, key2 = {isKey2: true};
    refMap.set(key1, defaultGetter1());
    refMap.set(key2, defaultGetter2());

    expect(testMap.getDefault(key1, key2, defaultGetter1)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key2, key1, defaultGetter2)).toBe(refMap.get(key2));
  });

  it("constructor initializes with iterator of first argument", () => {
    const key1 = {isKey1: true}, key2 = {isKey2: true},
          key3 = {isKey3: true}, key4 = {isKey4: true},
          value1 = "value1", value2 = "value2";

    const items: [object, unknown, unknown][] = [
      [key1, key2, value1],
      [key3, key4, value2],
    ];

    testMap = new WeakStrongMap(items);
    expect(testMap.get(key1, key2)).toBe(value1);
    expect(testMap.get(key3, key4)).toBe(value2);
  });

  describe("holds references to objects", () => {
    const externalKey = {}, externalValue = {};

    it("weakly as the first key in .delete()", async () => {
      await expectAsync(holdsArgument(
        10, 10, key => testMap.delete(key, externalKey)
      )).toBeResolvedTo(false);
    });

    it("weakly as the first key in .get()", async () => {
      await expectAsync(holdsArgument(
        10, 10, key => testMap.get(key, externalKey)
      )).toBeResolvedTo(false);
    });

    it("weakly as the first key in .has()", async () => {
      await expectAsync(holdsArgument(
        10, 10, key => testMap.has(key, externalKey)
      )).toBeResolvedTo(false);
    });

    it("weakly as the first key in .set()", async () => {
      await expectAsync(holdsArgument(
        10, 10, key => testMap.set(key, externalKey, externalValue)
      )).toBeResolvedTo(false);
    });

    it("weakly as the second key in .delete()", async () => {
      await expectAsync(holdsArgument(
        10, 10, key => testMap.delete(externalKey, key)
      )).toBeResolvedTo(false);
    });

    it("weakly as the second key in .get()", async () => {
      await expectAsync(holdsArgument(
        10, 10, key => testMap.get(externalKey, key)
      )).toBeResolvedTo(false);
    });

    it("weakly as the second key in .has()", async () => {
      await expectAsync(holdsArgument(
        10, 10, key => testMap.has(externalKey, key)
      )).toBeResolvedTo(false);
    });

    it("strongly as the second key in .set()", async () => {
      await expectAsync(holdsArgument(
        10, 10, key => testMap.set(externalKey, key, externalValue)
      )).toBeResolvedTo(true);
    });

    it("weakly as the second key through .add(), then .delete()", async () => {
      await expectAsync(holdsArgument(
        10, 10, key => {
          testMap.set(externalKey, key, externalValue);
          testMap.delete(externalKey, key);
        }
      )).toBeResolvedTo(false);
    });

    it("strongly as values when the keys are held externally", async () => {
      const externalKeys: unknown[] = [];
      await expectAsync(holdsArgument(
        10, 10, value => {
          let externalKey: unknown = {};
          testMap.set(externalKeys, externalKey, value);
          externalKeys.push(externalKey);
          externalKey = null;
        }
      )).toBeResolvedTo(true);

      externalKeys.forEach(externalKey => {
        expect(testMap.has(externalKeys, externalKey)).toBe(true);
      });
    });

    it("weakly as values when the keys are not held externally", async () => {
      await expectAsync(holdsArgument(
        10, 10, value => testMap.set({}, {}, value)
      )).toBeResolvedTo(false);
    });
  });
});
