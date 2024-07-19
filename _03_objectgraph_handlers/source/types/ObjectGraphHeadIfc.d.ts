/** This interface is for membrane use. */
export interface ObjectGraphHeadIfc {
  /** The unique graph key. */
  readonly objectGraphKey: string | symbol;

  get isRevoked(): boolean;

  /**
   * 
   * @param valueInSourceGraph - The value to wrap
   * @param sourceGraphKey - the object graph key where the value came from.
   *
   * @returns the value or proxy in _this_ object graph.
   */
  getValueInGraph(
    valueInSourceGraph: unknown,
    sourceGraphKey: string | symbol
  ): unknown;

  /** Revoke all proxies for a given object graph. */
  revokeAllProxiesForGraph(
    graphKey: string | symbol
  ): void;
}

/** This interface is for proxy handler use. */
export interface ObjectGraphConversionIfc {
  getRealTargetForShadowTarget(
    shadowTarget: object
  ): object;

  getTargetGraphKeyForRealTarget(
    realTarget: object,
  ): string | symbol;
}
