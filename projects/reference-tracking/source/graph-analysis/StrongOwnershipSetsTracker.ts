import type {
  JointOwnersResolver,
} from "./types/JointOwnersResolver.js";

import {
  JointOwnershipTracker,
} from "./JointOwnershipTracker.js";

export class StrongOwnershipSetsTracker {
  readonly #keyResolvedMap = new Map<number, boolean>;
  readonly #keyToTrackerSets = new Map<number, Set<JointOwnershipTracker>>;
  readonly #outerJointOwnersResolver: JointOwnersResolver<StrongOwnershipSetsTracker>;

  readonly #innerJointOwnersResolver: JointOwnersResolver<JointOwnershipTracker> = (
    childKey: number,
    jointOwnerKeys: readonly number[],
    parentToChildEdgeId: number,
    tracker: JointOwnershipTracker
  ): void =>
  {
    for (const ownerKey of jointOwnerKeys) {
      const innerSet = this.#keyToTrackerSets.get(ownerKey)!;
      innerSet.delete(tracker);
    }
    this.#outerJointOwnersResolver(
      childKey, jointOwnerKeys, parentToChildEdgeId, this
    );
  }

  constructor(
    jointOwnersResolver: JointOwnersResolver<StrongOwnershipSetsTracker>
  )
  {
    this.#outerJointOwnersResolver = jointOwnersResolver;
  }

  public defineKey(
    key: number
  ): void
  {
    if (this.#keyResolvedMap.has(key))
      throw new Error("key already defined: " + key);
    this.#keyResolvedMap.set(key, false);
    this.#keyToTrackerSets.set(key, new Set);
  }

  public resolveKey(
    key: number
  ): void
  {
    const isResolved = this.#keyResolvedMap.get(key);
    if (isResolved === undefined)
      throw new Error("key not defined: " + key);

    if (isResolved === true)
      return;

    this.#keyResolvedMap.set(key, true);

    const innerSet = this.#keyToTrackerSets.get(key)!;
    for (const innerTracker of innerSet) {
      innerTracker.keyWasResolved(key);
    }
  }

  public defineChildEdge(
    childKey: number,
    jointOwnerKeys: readonly number[],
    parentToChildEdgeId: number,
  ): void
  {
    for (const ownerKey of jointOwnerKeys) {
      if (!this.#keyResolvedMap.has(ownerKey))
        throw new Error("no resolved value defined for owner key " + ownerKey);
    }
    if (!this.#keyResolvedMap.has(childKey))
      throw new Error("no resolved value defined for child key " + childKey);

    const tracker = new JointOwnershipTracker(
      this.#keyResolvedMap,
      childKey,
      jointOwnerKeys,
      parentToChildEdgeId,
      this.#innerJointOwnersResolver
    );

    for (const ownerKey of jointOwnerKeys) {
      const innerSet = this.#keyToTrackerSets.get(ownerKey)!;
      innerSet.add(tracker);
    }

    tracker.fireCallbackIfEmpty();
  }
}