import WeakWeakMap from "../../../../source/collections/WeakWeakMap.js";
import holdsArgument from "../../support/gc/holdsArgument.js";

describe("WeakWeakMap really holds weak references", () => {
  const externalKey = {};
  let map: WeakWeakMap<object, object, unknown>;
  beforeEach(() => map = new WeakWeakMap);

  it("to the first key", async () => {
    await expectAsync(holdsArgument(5, 5, key => map.set(externalKey, key, true))).toBeResolvedTo(false);
  });

  it("to the second key", async () => {
    await expectAsync(holdsArgument(5, 5, key => map.set(key, externalKey, true))).toBeResolvedTo(false);
  });

  it("to values weakly", async () => {
    await expectAsync(holdsArgument(5, 5, value => map.set(externalKey, {}, value))).toBeResolvedTo(false);
  });

  it("except for values held strongly by both keys", async () => {
    const heldKeys = new Set<object>;
    await expectAsync(holdsArgument(5, 5, value => {
      const firstKey = {}, secondKey = {};
      heldKeys.add(firstKey);
      heldKeys.add(secondKey);
      map.set(firstKey, secondKey, value);
    })).toBeResolvedTo(true);
  });

  it("to values when keys are deleted", async () => {
    const heldKeys = new Set<object>;
    await expectAsync(holdsArgument(5, 5, value => {
      const firstKey = {}, secondKey = {};
      heldKeys.add(firstKey);
      heldKeys.add(secondKey);
      map.set(firstKey, secondKey, value);
      map.delete(firstKey, secondKey);
    })).toBeResolvedTo(false);
  });
});
