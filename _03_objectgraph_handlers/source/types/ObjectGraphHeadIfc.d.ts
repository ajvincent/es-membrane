import type {
  RequiredProxyHandler
} from "./RequiredProxyHandler.js";

export interface ProxyMetadata {
  readonly shadowTarget: object,
  readonly proxy: object;
}

export interface ObjectGraphHeadIfc extends RequiredProxyHandler {
  /** The unique graph key. */
  readonly objectGraphKey: string | symbol;

  /** An unique key to use for shadow targets. */
  readonly shadowTargetKey: symbol;

  get isRevoked(): boolean;

  /**
   * Build a new proxy which uses this as its proxy handler.
   * @param realTarget - the target to base the new proxy on.
   *
   * @returns the new proxy.
   */
  createNewProxy(realTarget: object, realTargetGraphKey: string | symbol): ProxyMetadata;

  /** Revoke all proxies this object graph owns. */
  revokeAllProxies(): void;
}
