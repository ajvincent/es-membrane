import WeakRefSet from "#stage_utilities/source/WeakRefSet.mjs";
import ConvertingHeadProxyHandler from "./generated/ConvertingHeadProxyHandler.js";

import type {
  ObjectGraphHandlerIfc
} from "./generated/types/ObjectGraphHandlerIfc.js";

import OneToOneStrongMap from "./maps/OneToOneStrongMap.js";

import type {
  MembraneIfc
} from "./types/MembraneIfc.js";

import type {
  ObjectGraphHeadIfc,
  ProxyMetadata,
} from "./types/ObjectGraphHeadIfc.js";

export default
class ObjectGraphHead extends ConvertingHeadProxyHandler implements ObjectGraphHeadIfc
{
  /**
   * Define a shadow target, so we can manipulate the proxy independently of the
   * original target.
   *
   * @param value - The original target.
   *
   * @returns A shadow target to minimally emulate the real one.
   */
  static #makeShadowTarget(value: object): object {
    let rv: object;
    if (Array.isArray(value))
      rv = [];
    else if (typeof value == "object")
      rv = {};
    else if (typeof value == "function")
      rv = function() {};
    else
      throw new Error("Unknown value for makeShadowTarget");
    return rv;
  }

  static readonly #realTargetKey = Symbol("(real target)");

  readonly objectGraphKey: string | symbol;
  readonly shadowTargetKey: symbol;

  readonly #revokersRefSet = new WeakRefSet<() => void>;

  // This is a special map, which I do _not_ want to put other membrane-specific properties into.  It's just for tracking revokers.
  #proxyToRevokeMap = new WeakMap<object, () => void>;
  #revoked = false;
  #targetsOneToOneMap = new OneToOneStrongMap<string | symbol, object>;

  #realTargetToOriginGraph = new WeakMap<object, string | symbol>;

  public constructor(
    membraneIfc: MembraneIfc,
    graphHandlerIfc: ObjectGraphHandlerIfc,
    objectGraphKey: string | symbol
  )
  {
    super(membraneIfc, graphHandlerIfc);
    this.objectGraphKey = objectGraphKey;
    this.shadowTargetKey = Symbol(
      typeof objectGraphKey === "string" ? `(shadow:${objectGraphKey})` : "(shadow)"
    );
  }

  public get isRevoked(): boolean {
    return this.#revoked;
  }

  public createNewProxy(
    realTarget: object,
    realTargetGraphKey: string | symbol
  ): ProxyMetadata
  {
    if (this.#revoked)
      throw new Error("This object graph has been revoked");

    const shadowTarget: object = ObjectGraphHead.#makeShadowTarget(realTarget);
    const {
      proxy,
      revoke
    } = Proxy.revocable<object>(shadowTarget, this);

    this.#revokersRefSet.addReference(revoke);
    this.#proxyToRevokeMap.set(proxy, revoke);

    this.#targetsOneToOneMap.bindOneToOne(
      this.objectGraphKey, proxy, this.shadowTargetKey, shadowTarget
    );
    this.#targetsOneToOneMap.bindOneToOne(
      this.objectGraphKey, proxy, ObjectGraphHead.#realTargetKey, realTarget
    );

    this.#realTargetToOriginGraph.set(realTarget, realTargetGraphKey);

    return {
      shadowTarget,
      proxy,
    };
  }

  public revokeAllProxies(): void
  {
    if (this.#revoked)
      throw new Error("This object graph has been revoked");

    this.#revoked = true;

    for (const revoker of this.#revokersRefSet.liveElements()) {
      revoker();
    }
    this.#revokersRefSet.clearReferences();

    // force a clearing
    this.#proxyToRevokeMap = new WeakMap;
    this.#targetsOneToOneMap = new OneToOneStrongMap;
    this.#realTargetToOriginGraph = new WeakMap;
  }

  protected getRealTargetForShadowTarget(
    shadowTarget: object
  ): object
  {
    return this.#targetsOneToOneMap.get(
      shadowTarget,
      ObjectGraphHead.#realTargetKey
    )!;
  }

  protected getTargetGraphKeyForRealTarget(
    realTarget: object
  ): string | symbol
  {
    return this.#realTargetToOriginGraph.get(realTarget)!;
  }
}
