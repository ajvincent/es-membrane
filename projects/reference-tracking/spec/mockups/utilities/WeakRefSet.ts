import { WeakRefSet } from "../../../source/mockups/utilities/WeakRefSet.js";

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
    expect(refSet.getReference(value)?.deref()).toBe(value);

    expect(refSet.deleteReference(value)).toBe(true);
    let elements = new Set<object>(refSet.liveElements());
    expect(elements.has(value)).toBe(false);
    expect(refSet.getReference(value)).toBeUndefined();

    expect(refSet.deleteReference(value)).toBe(false);

    addValue(); // we don't care about references we don't keep

    refSet.addReference(value);
    const secondValue = addValue();

    elements = new Set<object>(refSet.liveElements());
    expect(elements.has(value)).toBe(true);
    expect(elements.has(secondValue)).toBe(true);

    refSet.clearReferences();
    elements = new Set<object>(refSet.liveElements());
    expect(elements.size).toBe(0);
  });
});
