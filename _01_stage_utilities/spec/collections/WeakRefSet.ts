import WeakRefSet from "#stage_utilities/source/collections/WeakRefSet.js";
import holdsReturn from "#stage_utilities/source/gc/holdsReturn.mjs";

describe("WeakRefSet", () => {
  let refSet: WeakRefSet<object>;
  beforeEach(() => refSet = new WeakRefSet);

  function addValue(): object {
    const value = {};
    refSet.addReference(value);
    return value;
  }

  it("can hold references to values it knows about", () => {
    expect(refSet.hasReference({})).toBe(false);

    const value = addValue();
    expect(refSet.hasReference(value)).toBe(true);

    expect(refSet.deleteReference(value)).toBe(true);
    expect(refSet.deleteReference(value)).toBe(false);

    addValue(); // unreachable - we're not testing the size of elements.

    refSet.addReference(value);
    const secondValue = addValue();

    let elements = new Set<object>(refSet.liveElements());
    expect(elements.has(value)).toBe(true);
    expect(elements.has(secondValue)).toBe(true);

    refSet.clearReferences();
    elements = new Set<object>(refSet.liveElements());
    expect(elements.size).toBe(0);
  });

  xit("holds references to objects weakly", async () => {
    await expectAsync(holdsReturn(10, 10, addValue)).toBeResolvedTo(false);
  });
});