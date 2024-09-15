import OneToOneStrongMap from "#stage_utilities/source/collections/OneToOneStrongMap.js";

describe("OneToOneStrongMap", () => {
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

  it(".bindOneToOne() can join different pairings as long as there's no overlap", () => {
    map.bindOneToOne("red", redObj, "blue", blueObj);
    map.bindOneToOne("green", greenObj, "yellow", yellowObj);
    map.bindOneToOne("green", greenObj, "red", redObj);

    expect(map.get(blueObj, "yellow")).toBe(yellowObj);
  });

  it(".bindOneToOne() throws when there is an overlap", () => {
    map.bindOneToOne("red", redObj, "blue", blueObj);
    map.bindOneToOne("red", { unreachable: true }, "green", greenObj);

    expect(
      () => map.bindOneToOne("green", greenObj, "red", redObj)
    ).toThrowError("value_1 and value_2 have conflicting keys!");

    expect(
      () => map.bindOneToOne("blue", blueObj, "green", greenObj)
    ).toThrowError("value_1 and value_2 have conflicting keys!");
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

  it(".delete() removes unbound entries as well", () => {
    map.bindOneToOne("red", redObj, "blue", blueObj);
    map.bindOneToOne("red", redObj, "green", greenObj);

    expect(map.delete(redObj, "red")).toBeTrue();
    expect(map.get(redObj, "red")).toBeUndefined();
    expect(map.get(blueObj, "green")).toBe(greenObj);
    expect(map.get(redObj, "green")).toBeUndefined();
    expect(map.get(blueObj, "red")).toBeUndefined();

    expect(map.delete(redObj, "red")).toBeFalse();

    expect(map.delete(blueObj, "green")).toBeTrue();
    expect(map.get(blueObj, "blue")).toBeUndefined();
    expect(map.get(blueObj, "green")).toBeUndefined();
    expect(map.get(greenObj, "blue")).toBeUndefined();
    expect(map.get(greenObj, "green")).toBeUndefined();
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
