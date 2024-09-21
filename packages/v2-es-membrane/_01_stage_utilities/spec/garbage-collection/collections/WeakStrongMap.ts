import WeakStrongMap from "#stage_utilities/source/collections/WeakStrongMap.js";
import holdsArgument from "#stage_utilities/source/gc/holdsArgument.mjs";

describe("CodeGenerator(WeakStrongMap.mjs) holds references to objects", () => {
  let testMap: WeakStrongMap<object, unknown, unknown>, refMap = new Map;

  const defaultValue1 = Symbol("default value one");
  const defaultGetter1 = () => defaultValue1;
  const defaultValue2 = Symbol("default value two");
  const defaultGetter2 = () => defaultValue2;

  beforeEach(() => {
    refMap.clear();
    testMap = new WeakStrongMap();
  });

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
