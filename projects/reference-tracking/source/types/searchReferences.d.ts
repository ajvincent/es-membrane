/**
 * @param resultKey - an unique string key so searches can be distinguished from one another.
 * @param targetValue - the target we're searching for.
 * @param heldValues - the objects we presume are held strongly
 * @param strongReferencesOnly - true if we should ignore weak references.
 */
declare function searchReferences(
  this: void,
  resultsKey: string,
  targetValue: object,
  heldValues: readonly object[],
  strongReferencesOnly: boolean,
): void;
