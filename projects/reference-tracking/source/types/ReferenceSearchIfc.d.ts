export interface ReferenceSearchResultIfc {
  referencedObject: WeakKey,
  /**
   * Each key of this map is an object.
   * The value represents how we get from the object to the reference object.
   *
   * You can have number values for array indices.
   */
  jointOwners: ReadonlyMap<WeakKey, number | string | symbol>;
  isStrongReference: boolean;
}

export interface ReferenceSearchIfc {
  new (
    givenAsHeldStrongly: ReadonlyMap<WeakKey, string>,
    target: WeakKey,
    targetIdentifier: string,
    strongReferencesOnly: boolean,
  );
}
