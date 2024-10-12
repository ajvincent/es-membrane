import OneToOneStrongMap from "#stage_utilities/source/collections/OneToOneStrongMap.js";
import holdsArgument from "#stage_utilities/source/gc/holdsArgument.js";

describe("CodeGenerator(OneToOneStrongMap.js) to hold values", () => {
  let map: OneToOneStrongMap<unknown, object>;
  beforeEach(() => map = new OneToOneStrongMap);

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
      10, 10, (key: object): void => map.bindOneToOne(key, externalValue, {}, {})
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
      10, 10, (key: object): void => map.bindOneToOne(key, {}, {}, externalValue)
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
      10, 10, (key: object): void => map.bindOneToOne({}, key, {}, externalValue)
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
      10, 10, (key: object): void => map.bindOneToOne({}, externalValue, key, {})
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
      10, 10, (value: object): void => map.bindOneToOne({}, externalValue, {}, value)
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
