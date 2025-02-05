/**
 * 
 * @param targetValue - the target we're searching for.
 * @param heldValues - the objects we presume are held strongly
 * @param strongReferencesOnly - true if we should ignore weak references.
 *
 * @returns true if the search was successful, false if there was an unexpected problem.
 */
declare function searchReferences(
  resultsKey: string,
  targetValue: object,
  heldValues: readonly object[],
  strongReferencesOnly: boolean,
): boolean;
