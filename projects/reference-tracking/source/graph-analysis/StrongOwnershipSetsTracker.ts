import type {
  PrefixedNumber
} from "../types/PrefixedNumber.js";

import type {
  JointOwnersResolver,
} from "./types/JointOwnersResolver.js";

import {
  JointOwnershipTracker,
} from "./JointOwnershipTracker.js";

export class StrongOwnershipSetsTracker<
  KeyType extends PrefixedNumber<string>,
  Context extends PrefixedNumber<string>
>
{
  readonly #keyResolvedMap = new Map<KeyType, boolean>;
  readonly #keyToTrackerSets = new Map<KeyType, Set<JointOwnershipTracker<KeyType, Context>>>;
  readonly #outerJointOwnersResolver: JointOwnersResolver<
    StrongOwnershipSetsTracker<KeyType, Context>,
    KeyType,
    Context
  >;

  readonly #innerJointOwnersResolver: JointOwnersResolver<
    JointOwnershipTracker<KeyType, Context>,
    KeyType,
    Context
  > = (
    childKey: KeyType,
    jointOwnerKeys: readonly KeyType[],
    context: Context,
    tracker: JointOwnershipTracker<KeyType, Context>
  ): void =>
  {
    for (const ownerKey of jointOwnerKeys) {
      const innerSet = this.#keyToTrackerSets.get(ownerKey)!;
      innerSet.delete(tracker);
    }
    this.#outerJointOwnersResolver(
      childKey, jointOwnerKeys, context, this
    );
  }

  constructor(
    jointOwnersResolver: JointOwnersResolver<
      StrongOwnershipSetsTracker<KeyType, Context>,
      KeyType,
      Context
    >
  )
  {
    this.#outerJointOwnersResolver = jointOwnersResolver;
  }

  public defineKey(
    key: KeyType
  ): void
  {
    if (this.#keyResolvedMap.has(key))
      throw new Error("key already defined: " + key);
    this.#keyResolvedMap.set(key, false);
    this.#keyToTrackerSets.set(key, new Set);
  }

  public resolveKey(
    key: KeyType
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
    childKey: KeyType,
    jointOwnerKeys: readonly KeyType[],
    context: Context,
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
      context,
      this.#innerJointOwnersResolver
    );

    for (const ownerKey of jointOwnerKeys) {
      const innerSet = this.#keyToTrackerSets.get(ownerKey)!;
      innerSet.add(tracker);
    }

    tracker.fireCallbackIfEmpty();
  }
}
