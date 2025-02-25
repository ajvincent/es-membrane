import type {
  ObjectId,
  ReferenceId,
} from "../../source/types/PrefixedNumber.js";

import type {
  JointOwnersResolver
} from "../../source/graph-analysis/types/JointOwnersResolver.js";

import {
  StrongOwnershipSetsTracker
} from "../../source/graph-analysis/StrongOwnershipSetsTracker.js";

type SetsTracker = StrongOwnershipSetsTracker<ObjectId, ReferenceId>;

describe("StrongOwnershipSetsTracker", () => {
  const resolver = jasmine.createSpy<JointOwnersResolver<SetsTracker, ObjectId, ReferenceId>>("resolver");
  afterEach(() => resolver.calls.reset());

  let tracker: SetsTracker;
  beforeEach(() => tracker = new StrongOwnershipSetsTracker(resolver));

  it("resolving all keys before defining a child edge results in a self-resolving edge", () => {
    tracker.defineKey("object:1");
    tracker.defineKey("object:2");
    tracker.defineKey("object:3");
    tracker.resolveKey("object:2");
    tracker.resolveKey("object:3");

    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.defineChildEdge(
      "object:1", ["object:2", "object:3"], "reference:91"
    );
    expect(resolver).toHaveBeenCalledOnceWith(
      "object:1", ["object:2", "object:3"], "reference:91", tracker
    );
  });

  it("defining a child edge and then resolving all keys results in a self-resolving edge", () => {
    tracker.defineKey("object:1");
    tracker.defineKey("object:2");
    tracker.defineKey("object:3");

    tracker.defineChildEdge(
      "object:1", ["object:2", "object:3"], "reference:92"
    );
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.resolveKey("object:2");
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.resolveKey("object:3");
    expect(resolver).toHaveBeenCalledOnceWith(
      "object:1", ["object:2", "object:3"], "reference:92", tracker
    );
  });

  it("throws for unknown keys", () => {
    expect(
      () => tracker.resolveKey("object:4")
    ).toThrowError("key not defined: object:4");

    expect(
      () => tracker.defineChildEdge("object:6", [], "reference:93")
    ).toThrowError("no resolved value defined for child key object:6");

    tracker.defineKey("object:7");
    tracker.defineKey("object:8");

    expect(
      () => tracker.defineChildEdge("object:7", ["object:8", "object:9"], "reference:93")
    ).toThrowError("no resolved value defined for owner key object:9");
  });

  it("throws when trying to define a key twice", () => {
    tracker.defineKey("object:4");
    expect(
      () => tracker.defineKey("object:4")
    ).toThrowError("key already defined: object:4");
  });
});

