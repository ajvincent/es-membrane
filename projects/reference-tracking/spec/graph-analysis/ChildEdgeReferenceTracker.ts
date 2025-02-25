import type {
  JointOwnersResolver
} from "../../source/graph-analysis/types/JointOwnersResolver.js";

import {
  StrongOwnershipSetsTracker
} from "../../source/graph-analysis/StrongOwnershipSetsTracker.js";

describe("StrongOwnershipSetsTracker", () => {
  const resolver = jasmine.createSpy<JointOwnersResolver<StrongOwnershipSetsTracker>>("resolver");
  afterEach(() => resolver.calls.reset());

  let tracker: StrongOwnershipSetsTracker;
  beforeEach(() => tracker = new StrongOwnershipSetsTracker(resolver));

  it("resolving all keys before defining a child edge results in a self-resolving edge", () => {
    tracker.defineKey(1);
    tracker.defineKey(2);
    tracker.defineKey(3);
    tracker.resolveKey(2);
    tracker.resolveKey(3);

    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.defineChildEdge(1, [2, 3], 91);
    expect(resolver).toHaveBeenCalledOnceWith(1, [2, 3], 91, tracker);
  });

  it("defining a child edge and then resolving all keys results in a self-resolving edge", () => {
    tracker.defineKey(1);
    tracker.defineKey(2);
    tracker.defineKey(3);

    tracker.defineChildEdge(1, [2, 3], 92);
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.resolveKey(2);
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.resolveKey(3);
    expect(resolver).toHaveBeenCalledOnceWith(1, [2, 3], 92, tracker);
  });

  it("throws for unknown keys", () => {
    expect(
      () => tracker.resolveKey(4)
    ).toThrowError("key not defined: 4");

    expect(
      () => tracker.defineChildEdge(6, [], 93)
    ).toThrowError("no resolved value defined for child key 6");

    tracker.defineKey(7);
    tracker.defineKey(8);

    expect(
      () => tracker.defineChildEdge(7, [8, 9], 93)
    ).toThrowError("no resolved value defined for owner key 9");
  });

  it("throws when trying to define a key twice", () => {
    tracker.defineKey(4);
    expect(
      () => tracker.defineKey(4)
    ).toThrowError("key already defined: 4");
  });
});

