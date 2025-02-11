import type {
  JointOwnersResolver
} from "../../../source/engine262-tools/types/JointOwnersResolver.js";

import {
  JointOwnershipTracker
} from "../../../source/engine262-tools/search/JointOwnershipTracker.js";

describe("JointOwnershipTracker", () => {
  const resolver = jasmine.createSpy<JointOwnersResolver<JointOwnershipTracker>>("resolver");
  const keyResolvedMap = new Map<number, boolean>;

  afterEach(() => {
    keyResolvedMap.clear();
    resolver.calls.reset();
  });

  it("resolves immediately with no owner keys (should never happen, but...)", () => {
    const tracker = new JointOwnershipTracker(
      keyResolvedMap,
      12,
      [],
      false,
      resolver
    );
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.fireCallbackIfEmpty();

    expect(resolver).toHaveBeenCalledOnceWith(12, [], false, tracker);
    resolver.calls.reset();
  });

  it("resolves immediately when all owner keys have been pre-resolved", () => {
    keyResolvedMap.set(15, true);
    keyResolvedMap.set(23, true);

    const tracker = new JointOwnershipTracker(
      keyResolvedMap,
      8,
      [23, 15],
      true,
      resolver
    );
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.fireCallbackIfEmpty();

    expect(resolver).toHaveBeenCalledOnceWith(8, [23, 15], true, tracker);
    resolver.calls.reset();
  });

  it("resolves only when all owner keys have been resolved", () => {
    keyResolvedMap.set(6, true);
    keyResolvedMap.set(8, false);
    keyResolvedMap.set(3, false);

    const tracker = new JointOwnershipTracker(
      keyResolvedMap,
      2,
      [3, 6, 8],
      false,
      resolver
    );
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.fireCallbackIfEmpty();
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.keyWasResolved(3);
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.keyWasResolved(4); // this should never happen
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.keyWasResolved(6); // this can happen but it's a no-op
    expect(resolver).toHaveBeenCalledTimes(0);

    tracker.keyWasResolved(8);
    expect(resolver).toHaveBeenCalledOnceWith(2, [3, 6, 8], false, tracker);
    resolver.calls.reset();

    tracker.keyWasResolved(6); // it ignores later calls
    expect(resolver).toHaveBeenCalledTimes(0);
  });
});
