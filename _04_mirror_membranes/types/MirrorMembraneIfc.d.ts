export interface MirrorMembraneIfc {
  /** True if the membrane has been revoked. */
  readonly isRevoked: boolean;

  /**
   * Create an object graph.
   *
   * @param graphKey - the object graph's key.
   */
  createObjectGraph(graphKey: string | symbol): void;

  /**
   * Revoke an object graph.
   * @param graphKey - the object graph's key.
   */
  revokeObjectGraph(graphKey: string | symbol): boolean;

  /** Revoke the membrane and all object graphs.  After calling this, the membrane is dead. */
  revokeEverything(): void;

  /**
   * Get an object proxy in the target graph for a value in the source graph.
   *
   * Ideally you'll need to call this only for your starting object proxies.
   */
  convertObject<ObjectType extends object>(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    value: ObjectType
  ): ObjectType;
}
