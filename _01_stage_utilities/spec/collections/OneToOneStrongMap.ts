import OneToOneStrongMap from "#stage_utilities/source/collections/OneToOneStrongMap.js";

describe("CodeGenerator(OneToOneStrongMap.mjs)", () => {
  let map: OneToOneStrongMap<unknown, object>;
  beforeEach(() => map = new OneToOneStrongMap);

  const redObj = {}, blueObj = {}, greenObj = {}, yellowObj = {};

  it("class is frozen", () => {
    expect(Object.isFrozen(OneToOneStrongMap)).toBe(true);
    expect(Object.isFrozen(OneToOneStrongMap.prototype)).toBe(true);
  });

  it(".get() points from a source object to a target object after binding", () => {
    expect(map.get(redObj, "red")).toBe(undefined);
    expect(map.get(blueObj, "blue")).toBe(undefined);

    map.bindOneToOne("red", redObj, "blue", blueObj);

    expect(map.get(redObj, "blue")).toBe(blueObj);
    expect(map.get(blueObj, "red")).toBe(redObj);

    expect(map.get(redObj, "red")).toBe(redObj);
    expect(map.get(blueObj, "blue")).toBe(blueObj);
  });

  it(".bindOneToOne() accepts the same arguments twice", () => {
    map.bindOneToOne("red", redObj, "blue", blueObj);
    expect(
      () => map.bindOneToOne("red", redObj, "blue", blueObj)
    ).not.toThrow();

    expect(
      () => map.bindOneToOne("blue", blueObj, "red", redObj)
    ).not.toThrow();
  });

  it(".bindOneToOne() accepts different pairings as long as there's no overlap", () => {
    map.bindOneToOne("red", redObj, "blue", blueObj);
    expect(
      () => map.bindOneToOne("green", greenObj, "yellow", yellowObj)
    ).not.toThrow();

    expect(
      () => map.bindOneToOne("green", greenObj, "yellow", yellowObj)
    ).not.toThrow();

    expect(
      () => map.bindOneToOne("yellow", yellowObj, "green", greenObj)
    ).not.toThrow();

    expect(
      () => map.bindOneToOne("green", greenObj, "red", redObj)
    ).toThrowError("value_1 and value_2 are already in different one-to-one mappings!");
  });

  it(".bindOneToOne() accepts joining pairings as long as there's no overlap", () => {
    map.bindOneToOne("red", redObj, "blue", blueObj);
    expect(
      () => map.bindOneToOne("green", greenObj, "red", redObj)
    ).not.toThrow("value_2 mismatch!");

    expect(map.get(redObj, "blue")).toBe(blueObj);
    expect(map.get(blueObj, "red")).toBe(redObj);
    expect(map.get(greenObj, "blue")).toBe(blueObj);
  });

  it(".hasIdentity() returns true for a known identity", () => {
    map.bindOneToOne("red", redObj, "blue", blueObj);
    expect(map.hasIdentity(redObj, "red", false)).toBe(true);
    expect(map.hasIdentity(redObj, "red", true)).toBe(true);

    expect(map.hasIdentity(redObj, "blue", false)).toBe(false);
    expect(map.hasIdentity(redObj, "blue", true)).toBe(false);
  });

  it(".hasIdentity returns the boolean value of allowNotDefined for an unknown identity", () => {
    expect(map.hasIdentity(redObj, "red", false)).toBe(false);
    expect(map.hasIdentity(redObj, "red", true)).toBe(true);

    expect(map.hasIdentity(redObj, "blue", false)).toBe(false);
    expect(map.hasIdentity(redObj, "blue", true)).toBe(true);
  });

  it(".clear() clears the map entirely", () => {
    map.bindOneToOne("red", redObj, "blue", blueObj);
    map.clear();
    expect(map.get(redObj, "red")).toBeUndefined();
    expect(map.get(redObj, "blue")).toBeUndefined();
    expect(map.get(blueObj, "red")).toBeUndefined();
    expect(map.get(blueObj, "blue")).toBeUndefined();
  });
});
