import holdsArgument from "#stage_utilities/source/gc/holdsArgument.mjs";

import OneToOneStrongMap from "#aspects/stubs/source/maps/OneToOneStrongMap.js";

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

  describe("to hold values", () => {
    it("weakly as the first key to .bindOneToOne()", async () => {
      await expectAsync(holdsArgument(
        10, 10, (key: object): void => map.bindOneToOne(key, {}, {}, {})
      )).toBeResolvedTo(false);
    });

    it("weakly as the first value to .bindOneToOne()", async () => {
      await expectAsync(holdsArgument(
        10, 10, (key: object): void => map.bindOneToOne({}, key, {}, {})
      )).toBeResolvedTo(false);
    });

    it("weakly as the second key to .bindOneToOne()", async () => {
      await expectAsync(holdsArgument(
        10, 10, (key: object): void => map.bindOneToOne({}, {}, key, {})
      )).toBeResolvedTo(false);
    });

    it("weakly as the second value to .bindOneToOne()", async () => {
      await expectAsync(holdsArgument(
        10, 10, (key: object): void => map.bindOneToOne({}, {}, {}, key)
      )).toBeResolvedTo(false);
    });

    const externalKey = {};
    const externalValue = {};

    it("strongly as the first key with an external hold on the first value", async () => {
      await expectAsync(holdsArgument(
        10, 10, (key: object): void => map.bindOneToOne(key, externalKey, {}, {})
      )).toBeResolvedTo(true);
    });

    it("weakly as the first key with an external hold on the second key", async () => {
      // the values aren't held, so why would we hold the keys?
      await expectAsync(holdsArgument(
        10, 10, (key: object): void => map.bindOneToOne(key, {}, externalKey, {})
      )).toBeResolvedTo(false);
    });

    it("strongly as the first key with an external hold on the second value", async () => {
      await expectAsync(holdsArgument(
        10, 10, (key: object): void => map.bindOneToOne(key, {}, {}, externalKey)
      )).toBeResolvedTo(true);
    });

    it("weakly as the first value with an external hold on the first key", async () => {
      // cycle: value => internalKey + external key => value
      // cycle: value => internalKey + secondKey => secondValue => internalKey + externalKey => value
      // we're not holding second value, and we're testing if we hold value, so we don't hold that
      await expectAsync(holdsArgument(
        10, 10, (value: object): void => map.bindOneToOne(
          externalKey, value, { secondKey: true }, { secondValue: true }
        )
      )).toBeResolvedTo(false);
    });

    it("weakly as the first value with an external hold on the second key", async () => {
      // cycle: value => internalKey + firstKey => value
      // cycle: value => internalKey + externalKey => second value => internalKey + firstKey => value
      // we're not holding second value, and we're testing if we hold value, so we don't hold that
      await expectAsync(holdsArgument(
        10, 10, (value: object): void => map.bindOneToOne(
          {firstKey: true}, value, externalKey, { secondValue: true }
        )
      )).toBeResolvedTo(false);
    });

    it("strongly as the first value with an external hold on the second value", async () => {
      await expectAsync(holdsArgument(
        10, 10, (key: object): void => map.bindOneToOne({}, key, {}, externalKey)
      )).toBeResolvedTo(true);
    });

    it("weakly as the second key with an external hold on the first key", async () => {
      // the values aren't held, so why would we hold the keys?
      await expectAsync(holdsArgument(
        10, 10, (key: object): void => map.bindOneToOne(externalKey, {}, key, {})
      )).toBeResolvedTo(false);
    });

    it("strongly as the second key with an external hold on the first value", async () => {
      await expectAsync(holdsArgument(
        10, 10, (key: object): void => map.bindOneToOne({}, externalKey, key, {})
      )).toBeResolvedTo(true);
    });

    it("strongly as the second key with an external hold on the second value", async () => {
      // key is held strongly if and only if external value is held strongly, which it is
      await expectAsync(holdsArgument(
        10, 10, (key: object): void => map.bindOneToOne(
          {firstKey: true}, {firstValue: true}, key, externalValue
        )
      )).toBeResolvedTo(true);
    });

    it("weakly as the second value with an external hold on the first key", async () => {
      // cycle: value => internalKey + secondKey => value
      // cycle: value => internalKey + externalKey => first value => internalKey + secondKey => value
      // we're not holding first value, and we're testing if we hold value, so we don't hold that
      await expectAsync(holdsArgument(
        10, 10, (value: object): void => map.bindOneToOne(
          externalKey, {firstValue: true}, {secondKey: true}, value
        )
      )).toBeResolvedTo(false);
    });

    it("strongly as the second value with an external hold on the first value", async () => {
      await expectAsync(holdsArgument(
        10, 10, (key: object): void => map.bindOneToOne({}, externalKey, {}, key)
      )).toBeResolvedTo(true);
    });

    it("weakly as the second value with an external hold on the second key", async () => {
      // cycle: value => internalKey + external key => value
      // cycle: value => internalKey + first key => first value => internalKey + externalKey => value
      // we're not holding first value, and we're testing if we hold value, so we don't hold that
      await expectAsync(holdsArgument(
        10, 10, (value: object): void => map.bindOneToOne(
          {firstKey: true}, {firstValue: true}, externalKey, value
        )
      )).toBeResolvedTo(false);
    });
  });
});
