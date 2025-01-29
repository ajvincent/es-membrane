import type {
  ReferenceSearchIfc,
  ReferenceSearchResultIfc,
} from "source/types/ReferenceSearchIfc.js";

class ReferenceSearchResult implements ReferenceSearchResultIfc {
  referencedObject: WeakKey;
  jointOwners: ReadonlyMap<WeakKey, string | number | symbol>;
  isStrongReference: boolean;

  constructor(
    referencedObject: WeakKey,
    jointOwners: ReadonlyMap<WeakKey, number | string | symbol>,
    isStrongReference: boolean
  )
  {
    this.referencedObject = referencedObject;
    this.jointOwners = jointOwners;
    this.isStrongReference = isStrongReference;
  }
}

class ReferenceSearch {
  readonly #owners = new Map<WeakKey, ReferenceSearchResult>;
  readonly #target: WeakKey;
  readonly #targetIdentifier: string;
  readonly #strongReferencesOnly: boolean;

  // this represents values held weakly, which we may move to #owners if there is a strong reference we find later.
  readonly #weakOwners = new Map<WeakKey, ReferenceSearchResult>;

  constructor(
    givenAsHeldStrongly: ReadonlyMap<WeakKey, string>,
    target: WeakKey,
    targetIdentifier: string,
    strongReferencesOnly: boolean
  )
  {
    for (const heldRef of givenAsHeldStrongly.keys()) {
      const map = new Map<WeakKey, number | string | symbol>;
      map.set(this, "[[ReferenceSearchRoot]]");

      const result = new ReferenceSearchResult(heldRef, map, true);
      this.#owners.set(heldRef, result);
    }

    this.#target = target;
    this.#targetIdentifier = targetIdentifier;
    this.#strongReferencesOnly = strongReferencesOnly;

    void(this.#target);
    void(this.#targetIdentifier);
    void(this.#strongReferencesOnly);
    void(this.#weakOwners);
  }

  run(): ReadonlyMap<WeakKey, ReferenceSearchResultIfc> {
    /* Two passes:
    (1) Build up #owners and #weakOwners, until we find the desired reference to the target
    (2) Create a new result map from the target to the given held values and return it.
    */
    throw new Error("not yet implemented");
  }
}
ReferenceSearch satisfies ReferenceSearchIfc;

/**
 *
 * @param givenAsHeldStrongly - keys are the held keys, values are identifiers to use for them.
 * @param target
 * @param strongReferencesOnly
 * @returns
 */
export function searchReferences(
  givenAsHeldStrongly: ReadonlyMap<WeakKey, string>,
  target: WeakKey,
  targetIdentifier: string,
  strongReferencesOnly: boolean,
): ReadonlyMap<WeakKey, ReferenceSearchResultIfc>
{
  const search = new ReferenceSearch(givenAsHeldStrongly, target, targetIdentifier, strongReferencesOnly);
  return search.run();
}
