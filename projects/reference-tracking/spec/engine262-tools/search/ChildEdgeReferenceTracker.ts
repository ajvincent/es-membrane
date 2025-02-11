import type {
  JointOwnersResolver
} from "../../../source/engine262-tools/types/JointOwnersResolver.js";

import {
  ChildEdgeReferenceTracker
} from "../../../source/engine262-tools/search/ChildEdgeReferenceTracker.js";

describe("ChildEdgeReferenceTracker", () => {
  const resolver = jasmine.createSpy<JointOwnersResolver<ChildEdgeReferenceTracker>>("resolver");
  afterEach(() => resolver.calls.reset());

  let tracker: ChildEdgeReferenceTracker;
  beforeEach(() => tracker = new ChildEdgeReferenceTracker(resolver));

  it("resolving all keys before defining a child edge results in a self-resolving edge", () => {
    tracker.defineKey(1);
    tracker.defineKey(2);
    tracker.defineKey(3);
    tracker.resolveKey(2);
    tracker.resolveKey(3);

    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.defineChildEdge(1, [2, 3], true);
    expect(resolver).toHaveBeenCalledOnceWith(1, [2, 3], true, tracker);
  });

  it("defining a child edge and then resolving all keys results in a self-resolving edge", () => {
    tracker.defineKey(1);
    tracker.defineKey(2);
    tracker.defineKey(3);

    tracker.defineChildEdge(1, [2, 3], false);
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.resolveKey(2);
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.resolveKey(3);
    expect(resolver).toHaveBeenCalledOnceWith(1, [2, 3], false, tracker);
  });

  it("throws for unknown keys", () => {
    expect(
      () => tracker.resolveKey(4)
    ).toThrowError("key not defined: 4");

    expect(
      () => tracker.defineChildEdge(6, [], true)
    ).toThrowError("no resolved value defined for child key 6");

    tracker.defineKey(7);
    tracker.defineKey(8);

    expect(
      () => tracker.defineChildEdge(7, [8, 9], true)
    ).toThrowError("no resolved value defined for owner key 9");
  });

  it("throws when trying to define a key twice", () => {
    tracker.defineKey(4);
    expect(
      () => tracker.defineKey(4)
    ).toThrowError("key already defined: 4");
  });
});

