import StrongStrongMap from "../../../../source/collections/StrongStrongMap.js";
import holdsArgument from "../../support/gc/holdsArgument.js";

describe("StrongStrongMap really holds strong references", () => {
  const externalKey = {};
  let map: StrongStrongMap<object, object, unknown>;
  beforeEach(() => map = new StrongStrongMap);

  it("to the first key until deletion", async () => {
    await expectAsync(holdsArgument(5, 5, key => map.set(externalKey, key, true))).toBeResolvedTo(true);
    await expectAsync(holdsArgument(5, 5, key => {
      map.set(externalKey, key, true)
      map.delete(externalKey, key);
    })).toBeResolvedTo(false);
  });

  it("to the second key until deletion", async () => {
    await expectAsync(holdsArgument(5, 5, key => map.set(key, externalKey, true))).toBeResolvedTo(true);
    await expectAsync(holdsArgument(5, 5, key => {
      map.set(key, externalKey, true);
      map.delete(key, externalKey);
    })).toBeResolvedTo(false);
  });

  it("to values until deletion", async () => {
    await expectAsync(holdsArgument(5, 5, value => map.set(externalKey, {}, value))).toBeResolvedTo(true);
    await expectAsync(holdsArgument(5, 5, value => {
      const secondKey = {};
      map.set(externalKey, secondKey, value);
      map.delete(externalKey, secondKey);
    })).toBeResolvedTo(false);
  });
});
