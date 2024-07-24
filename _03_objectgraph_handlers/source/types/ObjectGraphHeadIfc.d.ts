/** This interface is for membrane use. */
export interface ObjectGraphHeadIfc extends ObjectGraphValuesIfc {
  /** The unique graph key. */
  readonly objectGraphKey: string | symbol;

  get isRevoked(): boolean;

  /** Revoke all proxies for a given object graph. */
  revokeAllProxiesForGraph(
    graphKey: string | symbol
  ): void;
}

/** This interface is for proxy handler use. */
export interface ObjectGraphConversionIfc extends ObjectGraphValuesIfc {
  /**
   * Get the real target matching a shadow target.
   * @param shadowTarget - the shadow target I created a proxy from.
   * @internal
   */
  getRealTargetForShadowTarget(
    shadowTarget: object
  ): object;

  /**
   * Get the object graph key a real target belongs to.
   * @param realTarget - the real target
   * @internal
   */
  getTargetGraphKeyForRealTarget(
    realTarget: object,
  ): string | symbol;
}

export interface ObjectGraphValuesIfc {
  /**
   * This method exists to return an array of proxies, not a proxy to an array of values.
   */
  getArrayInGraph<Elements extends unknown[] = unknown[]>(
    valuesInSourceGraph: Elements,
    sourceGraphKey: string | symbol
  ): Elements;

  /**
   * @param descriptorInSourceGraph - the descriptor to wrap.
   * @param sourceGraphKey - the object graph key where the value came from.
   *
   * @returns the property descriptor for _this_ object graph.
   */
  getDescriptorInGraph(
    descriptorInSourceGraph: PropertyDescriptor | undefined,
    sourceGraphKey: string | symbol
  ): PropertyDescriptor | undefined;

  /**
   * @param valueInSourceGraph - The value to wrap
   * @param sourceGraphKey - the object graph key where the value came from.
   *
   * @returns the value or proxy in _this_ object graph.
   */
  getValueInGraph(
    valueInSourceGraph: unknown,
    sourceGraphKey: string | symbol
  ): unknown;
}

export interface ObjectGraphValueCallbacksIfc {
  /**
   * A callbacks interface for the object graph proxy handlers.
   * @param thisGraphValues - the object graph head.
   * @internal
   */
  setThisGraphValues(
    thisGraphValues: ObjectGraphValuesIfc
  ): void;
}
