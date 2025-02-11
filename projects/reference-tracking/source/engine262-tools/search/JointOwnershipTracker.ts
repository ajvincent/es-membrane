import type {
  JointOwnersResolver,
} from "../types/JointOwnersResolver.js";

export class JointOwnershipTracker {
  readonly #childKey: number;
  readonly #jointOwnerKeys: readonly number[];
  readonly #isStrongOwningReference: boolean;
  readonly #resolver: JointOwnersResolver<JointOwnershipTracker>;

  readonly #pendingValues: Set<number>;

  constructor(
    keyResolvedMap: ReadonlyMap<number, boolean>,
    childKey: number,
    jointOwnerKeys: readonly number[],
    isStrongOwningReference: boolean,
    resolver: JointOwnersResolver<JointOwnershipTracker>,
  )
  {
    this.#childKey = childKey;
    this.#jointOwnerKeys = jointOwnerKeys.slice();
    this.#isStrongOwningReference = isStrongOwningReference;
    this.#resolver = resolver;

    this.#pendingValues = new Set(jointOwnerKeys.filter(v => !keyResolvedMap.get(v)));
  }

  keyWasResolved(key: number): void {
    if (this.#pendingValues.delete(key))
      this.fireCallbackIfEmpty();
  }

  fireCallbackIfEmpty() {
    if (this.#pendingValues.size > 0)
      return;

    this.#resolver(
      this.#childKey,
      this.#jointOwnerKeys,
      this.#isStrongOwningReference,
      this
    );
  }
}
