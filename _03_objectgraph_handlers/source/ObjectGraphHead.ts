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
  static #makeShadowTarget<T extends object>(value: T): T {
    let rv: object;
    if (Array.isArray(value))
      rv = [];
    else if (typeof value === "object")
      rv = {};
    else if (typeof value === "function")
      rv = function() {};
    else
      throw new Error("Unknown value for makeShadowTarget");
    return rv as T;
  }

  readonly objectGraphKey: string | symbol;
  readonly #revokersRefSet = new WeakRefSet<() => void>;

  // This is a special map, which I do _not_ want to put other membrane-specific properties into.  It's just for tracking revokers.
  #proxyToRevokeMap = new WeakMap<object, () => void>;

  #revoked = false;

  #targetsOneToOneMap: OneToOneStrongMap<string | symbol, object>;
  #shadowTargetToRealTargetMap = new WeakMap<object, object>;
  #realTargetToOriginGraph = new WeakMap<object, string | symbol>;

  public constructor(
    membraneIfc: MembraneIfc,
    graphHandlerIfc: ObjectGraphHandlerIfc,
    objectsOneToOneMap: OneToOneStrongMap<string | symbol, object>,
    objectGraphKey: string | symbol
  )
  {
    super(membraneIfc, graphHandlerIfc);
    this.#targetsOneToOneMap = objectsOneToOneMap;
    this.objectGraphKey = objectGraphKey;
  }

  public get isRevoked(): boolean {
    return this.#revoked;
  }

  public getValueInGraph<T>(sourceValue: T, sourceGraphKey: string | symbol): T {
    if (this.objectGraphKey === sourceGraphKey)
      return sourceValue;

    switch (typeof sourceValue) {
      case "boolean":
      case "bigint":
      case "number":
      case "string":
      case "symbol":
      case "undefined":
        //TODO: wrap in a compartment?
        return sourceValue;

      case "object":
        if (sourceValue === null)
          return sourceValue;
    }

    // TODO: primordials (Object, Array, etc.) and their prototypes

    // sourceValue is an object
    let value: object | undefined = this.#targetsOneToOneMap.get(sourceValue as object, this.objectGraphKey);
    if (value === undefined) {
      value = this.#createNewProxy(sourceValue as object, sourceGraphKey);
    }
    return value as T;
  }

  #createNewProxy(
    realTarget: object,
    realTargetGraphKey: string | symbol
  ): object
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

    this.#shadowTargetToRealTargetMap.set(shadowTarget, realTarget);
    this.#targetsOneToOneMap.bindOneToOne(
      this.objectGraphKey, proxy, realTargetGraphKey, realTarget
    );

    this.#realTargetToOriginGraph.set(realTarget, realTargetGraphKey);

    return proxy;
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

    this.#shadowTargetToRealTargetMap = new WeakMap;
    this.#realTargetToOriginGraph = new WeakMap;
    this.#targetsOneToOneMap = new OneToOneStrongMap;
  }

  protected getRealTargetForShadowTarget(
    shadowTarget: object
  ): object
  {
    return this.#shadowTargetToRealTargetMap.get(shadowTarget)!;
  }

  protected getTargetGraphKeyForRealTarget(
    realTarget: object
  ): string | symbol
  {
    return this.#realTargetToOriginGraph.get(realTarget)!;
  }
}
