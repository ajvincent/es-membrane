export interface SearchConfiguration {
  /**
   * Callback for when a search starts.
   * @param sourceSpecifier - the location of the source file
   * @param resultKey - an unique string key so searches can be distinguished from one another.
   */
  beginSearch?(sourceSpecifier: string, resultsKey: string): void;

  /**
   * Callback for when a search ends.
   * @param sourceSpecifier - the location of the source file
   * @param resultKey - an unique string key so searches can be distinguished from one another.
   */
  endSearch?(sourceSpecifier: string, resultsKey: string): void;

  /** Ye olde log function. */
  log?(message: string): void;

  /**
   * A callback for when we attempt to define a node, even if the node already exists.
   * @param newWeakKey - the weak key we have.
   * @param details - contextual details as to why we tried to do this.
   */
  defineNodeTrap?: (parentKey: string, newWeakKey: string, details: string) => void;

  /**
   * A callback for when we actually build a weak key.
   * @param weakKey - the new weak key.
   */
  defineWeakKeyTrap?: (weakKey: string) => void;

  /**
   * A callback for defining a graph edge.
   * @param parentId - the parent node id.
   * @param edgeId - the edge id.
   * @param childId - the child node id.
   * @param secondParentId - a second parent node id, if available.
   * @param isStrongReference - true if the reference is a strong one.
   * @returns
   */
  defineEdgeTrap?: (
    parentId: string,
    edgeId: string,
    childId: string,
    secondParentId: string | undefined,
    isStrongReference: boolean
  ) => void;

  /**
   * Callback for when a searchReferences() call has an unexpected internal error.
   */
  internalErrorTrap?: () => void;

  /**
   * True if we should exclude values available to functions (this, super, arguments).
   * Usually you do not want this, but for internal development purposes (reducing noise
   * in search-references-host testcases) this can be very helpful.
   */
  noFunctionEnvironment?: boolean;
}
