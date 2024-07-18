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

  get isRevoked(): boolean;

  getValueInGraph(realTarget: unknown, realTargetGraphKey: string | symbol): unknown;

  /** Revoke all proxies for a given object graph. */
  revokeAllProxiesForGraph(
    graphKey: string | symbol
  ): void;
}
