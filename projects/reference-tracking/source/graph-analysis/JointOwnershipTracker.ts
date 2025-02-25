import type {
  JointOwnersResolver,
} from "./types/JointOwnersResolver.js";

import type {
  PrefixedNumber
} from "../types/PrefixedNumber.js";

export class JointOwnershipTracker<
  KeyType extends PrefixedNumber<string>,
  Context extends PrefixedNumber<string>
>
{
  readonly #childKey: KeyType;
  readonly #jointOwnerKeys: readonly KeyType[];
  readonly #context: Context;
  readonly #resolver: JointOwnersResolver<JointOwnershipTracker<KeyType, Context>, KeyType, Context>;

  readonly #pendingValues: Set<KeyType>;

  constructor(
    keyResolvedMap: ReadonlyMap<KeyType, boolean>,
    childKey: KeyType,
    jointOwnerKeys: readonly KeyType[],
    context: Context,
    resolver: JointOwnersResolver<JointOwnershipTracker<KeyType, Context>, KeyType, Context>,
  )
  {
    this.#childKey = childKey;
    this.#jointOwnerKeys = jointOwnerKeys.slice();
    this.#context = context;
    this.#resolver = resolver;

    this.#pendingValues = new Set(jointOwnerKeys.filter(v => !keyResolvedMap.get(v)));
  }

  keyWasResolved(key: KeyType): void {
    if (this.#pendingValues.delete(key))
      this.fireCallbackIfEmpty();
  }

  fireCallbackIfEmpty() {
    if (this.#pendingValues.size > 0)
      return;

    this.#resolver(
      this.#childKey,
      this.#jointOwnerKeys,
      this.#context,
      this
    );
  }
}
