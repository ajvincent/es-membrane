export interface ObjectGraphHeadIfc extends Required<ProxyHandler<object>> {
  /** The unique graph key. */
  readonly objectGraphKey: string | symbol;

  /**
   * Build a new proxy which uses this as its proxy handler.
   * @param realTarget - the target to base the new proxy on.
   *
   * @returns the new proxy.
   */
  createNewProxy<T extends object>(realTarget: T): T;

  /** Revoke all proxies this object graph owns. */
  revokeAllProxies(): void;
}
