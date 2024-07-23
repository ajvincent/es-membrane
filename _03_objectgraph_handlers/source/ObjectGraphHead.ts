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
  ObjectGraphConversionIfc,
  ObjectGraphValueCallbacksIfc,
} from "./types/ObjectGraphHeadIfc.js";

import RevokerManagement from "./RevokerManagement.js";

export default
class ObjectGraphHead implements ObjectGraphHeadIfc, ObjectGraphConversionIfc
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

  static readonly #propertyDescriptorKeys: (keyof PropertyDescriptor)[] = [
    "configurable",
    "enumerable",
    "value",
    "writable",
    "get",
    "set",
  ];

  readonly objectGraphKey: string | symbol;

  #revoked = false;

  #convertingHeadProxyHandler?: ConvertingHeadProxyHandler;
  #targetsOneToOneMap?: OneToOneStrongMap<string | symbol, object>;
  #shadowTargetToRealTargetMap? = new WeakMap<object, object>;
  #realTargetToOriginGraph? = new WeakMap<object, string | symbol>;
  #revokerManagement?: RevokerManagement;

  public constructor(
    membraneIfc: MembraneIfc,
    graphHandlerIfc: ObjectGraphHandlerIfc & ObjectGraphValueCallbacksIfc,
    objectsOneToOneMap: OneToOneStrongMap<string | symbol, object>,
    objectGraphKey: string | symbol
  )
  {
    this.#targetsOneToOneMap = objectsOneToOneMap;

    this.objectGraphKey = objectGraphKey;
    this.#revokerManagement = new RevokerManagement(objectGraphKey);

    graphHandlerIfc.setThisGraphValues(this);

    this.#convertingHeadProxyHandler = new ConvertingHeadProxyHandler(
      membraneIfc, graphHandlerIfc, this
    );
  }

  public get isRevoked(): boolean {
    return this.#revoked;
  }

  public getArrayInGraph<
    ValueTypes extends unknown[]
  >
  (
    valuesInSourceGraph: ValueTypes,
    sourceGraphKey: string | symbol
  ): ValueTypes
  {
    //TODO: wrap in a compartment?
    return valuesInSourceGraph.map(value => this.getValueInGraph(value, sourceGraphKey)) as ValueTypes;
  }

  public getDescriptorInGraph(
    descriptorInSourceGraph: PropertyDescriptor | undefined,
    sourceGraphKey: string | symbol
  ): PropertyDescriptor | undefined
  {
    if (typeof descriptorInSourceGraph === "undefined") {
      return this.getValueInGraph<undefined>(descriptorInSourceGraph, sourceGraphKey);
    }

    //TODO: wrap in a compartment?
    const graphDescriptor: PropertyDescriptor = {};

    for (const key of ObjectGraphHead.#propertyDescriptorKeys) {
      if (Reflect.has(descriptorInSourceGraph, key) === false)
        continue;
      graphDescriptor[key] = this.getValueInGraph(
        descriptorInSourceGraph[key], sourceGraphKey
      );
    }

    return graphDescriptor;
  }

  public getValueInGraph<T>(valueInSourceGraph: T, sourceGraphKey: string | symbol): T {
    if (this.#revoked)
      throw new Error("This object graph has been revoked");

    switch (typeof valueInSourceGraph) {
      case "boolean":
      case "bigint":
      case "number":
      case "string":
      case "symbol":
      case "undefined":
        return this.getPrimitiveInGraph(valueInSourceGraph);

      case "object":
        if (valueInSourceGraph === null)
          return this.getPrimitiveInGraph(valueInSourceGraph);
    }

    // sourceValue is an object
    const objectInSourceGraph = valueInSourceGraph as object;
    let value: object | undefined = this.#targetsOneToOneMap!.get(objectInSourceGraph, this.objectGraphKey);
    if (value === undefined) {
      if (sourceGraphKey === this.objectGraphKey)
        value = objectInSourceGraph;
      else
        value = this.getIntrinsicInGraph(objectInSourceGraph, sourceGraphKey) ??
          this.#createNewProxy(objectInSourceGraph, sourceGraphKey);
    }

    return value as T;
  }

  protected getPrimitiveInGraph<
    T extends boolean | bigint | number | null | string | symbol | undefined
  >(valueInSourceGraph: T): T
  {
    //TODO: wrap in a compartment?  If so, consider updating #makeShadowTarget to be non-static
    return valueInSourceGraph;
  }

  protected getIntrinsicInGraph<
    T extends object
  >(valueInSourceGraph: T, sourceGraphKey: string | symbol): T | undefined
  {
    // TODO: intrinsics (Object, Array, etc.) and their prototypes
    return undefined;
  }

  #createNewProxy(
    objectInSourceGraph: object,
    sourceGraphKey: string | symbol
  ): object
  {
    const shadowTarget: object = ObjectGraphHead.#makeShadowTarget(objectInSourceGraph);
    const {
      proxy,
      revoke
    } = Proxy.revocable<object>(shadowTarget, this.#convertingHeadProxyHandler!);

    this.#revokerManagement!.addRevoker(proxy, revoke, sourceGraphKey);

    this.#shadowTargetToRealTargetMap!.set(shadowTarget, objectInSourceGraph);
    this.#targetsOneToOneMap!.bindOneToOne(
      this.objectGraphKey, proxy, sourceGraphKey, objectInSourceGraph
    );

    this.#realTargetToOriginGraph!.set(objectInSourceGraph, sourceGraphKey);

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

      this.#shadowTargetToRealTargetMap = undefined;
      this.#realTargetToOriginGraph = undefined;
      this.#targetsOneToOneMap = undefined;
      this.#revokerManagement = undefined;
      this.#convertingHeadProxyHandler = undefined;
    }
  }

  public getRealTargetForShadowTarget(
    shadowTarget: object
  ): object
  {
    if (this.#revoked)
      throw new Error("This object graph has been revoked");
    return this.#shadowTargetToRealTargetMap!.get(shadowTarget)!;
  }

  public getTargetGraphKeyForRealTarget(
    realTarget: object
  ): string | symbol
  {
    if (this.#revoked)
      throw new Error("This object graph has been revoked");
    return this.#realTargetToOriginGraph!.get(realTarget)!;
  }
}
