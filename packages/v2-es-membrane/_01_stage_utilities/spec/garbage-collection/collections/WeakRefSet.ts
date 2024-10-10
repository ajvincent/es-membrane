import WeakRefSet from "#stage_utilities/source/collections/WeakRefSet.js";
import holdsReturn from "#stage_utilities/source/gc/holdsReturn.js";

it("WeakRefSet holds references to objects weakly", async () => {
  const refSet: WeakRefSet<object> = new WeakRefSet;

  function addValue(): object {
    const value = {};
    refSet.addReference(value);
    return value;
  }

  await expectAsync(holdsReturn(10, 10, addValue)).toBeResolvedTo(false);
});
