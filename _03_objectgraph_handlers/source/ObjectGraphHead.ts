import ConvertingHeadProxyHandler from "./generated/ConvertingHeadProxyHandler.js";

import type {
  ObjectGraphHandlerIfc
} from "./generated/types/ObjectGraphHandlerIfc.js";

import OneToOneStrongMap from "../../_01_stage_utilities/source/collections/OneToOneStrongMap.js";

import type {
  MembraneIfc
} from "./types/MembraneIfc.js";

import type {
  ObjectGraphHeadIfc,
} from "./types/ObjectGraphHeadIfc.js";

import RevokerManagement from "./RevokerManagement.js";

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

  #revokerManagement?: RevokerManagement;

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
    this.#revokerManagement = new RevokerManagement(objectGraphKey);
  }

  public get isRevoked(): boolean {
    return this.#revoked;
  }

  public getValueInGraph<T>(valueInSourceGraph: T, sourceGraphKey: string | symbol): T {
    switch (typeof valueInSourceGraph) {
      case "boolean":
      case "bigint":
      case "number":
      case "string":
      case "symbol":
      case "undefined":
        //TODO: wrap in a compartment?
        return valueInSourceGraph;

      case "object":
        if (valueInSourceGraph === null)
          return valueInSourceGraph;
    }

    // TODO: primordials (Object, Array, etc.) and their prototypes

    // sourceValue is an object
    const objectInSourceGraph = valueInSourceGraph as object;
    let value: object | undefined = this.#targetsOneToOneMap.get(objectInSourceGraph, this.objectGraphKey);
    if (value === undefined) {
      if (sourceGraphKey === this.objectGraphKey)
        value = objectInSourceGraph;
      else
        value = this.#createNewProxy(objectInSourceGraph, sourceGraphKey);
    }

    return value as T;
  }

  #createNewProxy(
    objectInSourceGraph: object,
    sourceGraphKey: string | symbol
  ): object
  {
    if (this.#revoked)
      throw new Error("This object graph has been revoked");

    const shadowTarget: object = ObjectGraphHead.#makeShadowTarget(objectInSourceGraph);
    const {
      proxy,
      revoke
    } = Proxy.revocable<object>(shadowTarget, this);

    this.#revokerManagement!.addRevoker(proxy, revoke, sourceGraphKey);

    this.#shadowTargetToRealTargetMap.set(shadowTarget, objectInSourceGraph);
    this.#targetsOneToOneMap.bindOneToOne(
      this.objectGraphKey, proxy, sourceGraphKey, objectInSourceGraph
    );

    this.#realTargetToOriginGraph.set(objectInSourceGraph, sourceGraphKey);

    return proxy;
  }

  public revokeAllProxiesForGraph(
    graphKey: string | symbol
  ): void
  {
    if (this.#revoked)
      throw new Error("This object graph has been revoked");

    this.#revokerManagement!.revokeSet(graphKey);

    if (graphKey === this.objectGraphKey) {
      this.#revoked = true;

      this.#shadowTargetToRealTargetMap = new WeakMap;
      this.#realTargetToOriginGraph = new WeakMap;
      this.#targetsOneToOneMap = new OneToOneStrongMap;
      this.#revokerManagement = undefined;
    }
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
