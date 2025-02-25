import type {
  ObjectId,
  ReferenceId,
} from "../../source/graph-analysis/types/GraphIds.js";

import type {
  JointOwnersResolver
} from "../../source/graph-analysis/types/JointOwnersResolver.js";

import {
  JointOwnershipTracker
} from "../../source/graph-analysis/JointOwnershipTracker.js";

type Tracker = JointOwnershipTracker<ObjectId, ReferenceId>;

describe("JointOwnershipTracker", () => {
  const resolver = jasmine.createSpy<JointOwnersResolver<Tracker, ObjectId, ReferenceId>>("resolver");
  const keyResolvedMap = new Map<ObjectId, boolean>;

  afterEach(() => {
    keyResolvedMap.clear();
    resolver.calls.reset();
  });

  it("resolves immediately with no owner keys (should never happen, but...)", () => {
    const tracker = new JointOwnershipTracker<ObjectId, ReferenceId>(
      keyResolvedMap,
      "object:12",
      [],
      "reference:87",
      resolver
    );
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.fireCallbackIfEmpty();

    expect(resolver).toHaveBeenCalledOnceWith("object:12", [], "reference:87", tracker);
    resolver.calls.reset();
  });

  it("resolves immediately when all owner keys have been pre-resolved", () => {
    keyResolvedMap.set("object:15", true);
    keyResolvedMap.set("object:23", true);

    const tracker = new JointOwnershipTracker<ObjectId, ReferenceId>(
      keyResolvedMap,
      "object:8",
      ["object:23", "object:15"],
      "reference:88",
      resolver
    );
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.fireCallbackIfEmpty();

    expect(resolver).toHaveBeenCalledOnceWith(
      "object:8",
      ["object:23", "object:15"],
      "reference:88",
      tracker
    );
    resolver.calls.reset();
  });

  it("resolves only when all owner keys have been resolved", () => {
    keyResolvedMap.set("object:6", true);
    keyResolvedMap.set("object:8", false);
    keyResolvedMap.set("object:3", false);

    const tracker = new JointOwnershipTracker<ObjectId, ReferenceId>(
      keyResolvedMap,
      "object:2",
      ["object:3", "object:6", "object:8"],
      "reference:89",
      resolver
    );
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.fireCallbackIfEmpty();
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.keyWasResolved("object:3");
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.keyWasResolved("object:4"); // this should never happen
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.keyWasResolved("object:6"); // this can happen but it's a no-op
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.keyWasResolved("object:8");
    expect(resolver).toHaveBeenCalledOnceWith(
      "object:2",
      ["object:3", "object:6", "object:8"],
      "reference:89",
      tracker
    );
    resolver.calls.reset();

    tracker.keyWasResolved("object:6"); // it ignores later calls
    expect(resolver).toHaveBeenCalledTimes(0);
  });
});
