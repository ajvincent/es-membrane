import ConvertingHeadProxyHandler from "./generated/ConvertingHeadProxyHandler.js";

import type {
  ObjectGraphHandlerIfc
} from "./generated/types/ObjectGraphHandlerIfc.js";

import OneToOneStrongMap from "../../stage_utilities/source/collections/OneToOneStrongMap.js";

import {
  type GraphHeadInternalsIfc,
  LiveGraphHeadInternals,
  RevokedGraphHeadInternals,
} from "./GraphHeadInternals.js";

import type {
  MembraneInternalIfc
} from "./types/MembraneInternalIfc.js";

import type {
  ObjectGraphHeadIfc,
  ObjectGraphConversionIfc,
  ObjectGraphValueCallbacksIfc,
} from "./types/ObjectGraphHeadIfc.js";


import {
  type PrimitiveType,
  valueType
} from "./sharedUtilities.js";

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

  // ObjectGraphHeadIfc
  readonly objectGraphKey: string | symbol;
  #graphHeadInternals: GraphHeadInternalsIfc;

  /**
   * The bridge between an object graph proxy handler and the membrane.
   * @param membraneIfc - the membrane
   * @param graphHandlerIfc - the extended object graph proxy handler.
   * @param proxiesOneToOneMap - the one-to-one mapping to use for objects to object graph keys.
   * @param objectGraphKey - our object graph key.
   */
  public constructor(
    membraneIfc: MembraneInternalIfc,
    graphHandlerIfc: ObjectGraphHandlerIfc & ObjectGraphValueCallbacksIfc,
    proxiesOneToOneMap: OneToOneStrongMap<string | symbol, object>,
    objectGraphKey: string | symbol
  )
  {
    this.objectGraphKey = objectGraphKey;
    graphHandlerIfc.setThisGraphValues(this);

    const convertingHeadProxyHandler = new ConvertingHeadProxyHandler(
      membraneIfc, graphHandlerIfc, this
    );
    this.#graphHeadInternals = new LiveGraphHeadInternals(
      convertingHeadProxyHandler,
      proxiesOneToOneMap
    );
  }

  // ObjectGraphHeadIfc
  public get isRevoked(): boolean {
    return this.#graphHeadInternals.revoked;
  }

  // ObjectGraphValuesIfc
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

  // ObjectGraphValuesIfc
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

  // ObjectGraphValuesIfc
  public getValueInGraph<T>(
    valueInSourceGraph: T,
    sourceGraphKey: string | symbol
  ): T
  {
    if (this.#graphHeadInternals.revoked)
      throw new Error("This object graph has been revoked");

    if (valueType(valueInSourceGraph) === "primitive")
      return this.getPrimitiveInGraph(valueInSourceGraph as PrimitiveType) as T;

    // sourceValue is an object
    const objectInSourceGraph = valueInSourceGraph as object;
    let value: object | undefined = this.#graphHeadInternals.proxiesOneToOneMap.get(objectInSourceGraph, this.objectGraphKey);
    if (value === undefined) {
      if (sourceGraphKey === this.objectGraphKey)
        value = objectInSourceGraph;
      else {
        value = this.getIntrinsicInGraph(objectInSourceGraph, sourceGraphKey) ??
          this.#createNewProxy(objectInSourceGraph, sourceGraphKey);

        this.#graphHeadInternals.proxiesOneToOneMap.bindOneToOne(
          this.objectGraphKey, value, sourceGraphKey, objectInSourceGraph
        );
      }
    }

    return value as T;
  }

  /**
   * This is a subclass hook for getting a primitive value in this object graph (realm / compartment).
   * @param valueInSourceGraph - the primitive value in the source graph
   * @returns a matching primitive in this object graph.
   * @remarks
   *
   * This part I haven't explored yet, but SES-shim might be a good place to look.
   */
  protected getPrimitiveInGraph<
    T extends PrimitiveType
  >(valueInSourceGraph: T): T
  {
    //TODO: wrap in a compartment?  If so, consider updating #makeShadowTarget to be non-static
    return valueInSourceGraph;
  }

  /**
   * This is a subclass hook for wrapping intrinsics (Object, Array, Date, etc.) and their prototypes.
   * @param valueInSourceGraph - the value in a foreign source graph.
   * @param sourceGraphKey - the source graph the value comes from.
   *
   * @remarks
   *
   * This part I haven't explored yet, but SES-shim might be a good place to look.
   */
  protected getIntrinsicInGraph<
    T extends object
  >(
    valueInSourceGraph: T,
    sourceGraphKey: string | symbol
  ): T | undefined
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
    } = Proxy.revocable<object>(shadowTarget, this.#graphHeadInternals.convertingHeadProxyHandler);

    this.#graphHeadInternals.keyedRevokerSets.addRevoker(proxy, revoke, [this.objectGraphKey, sourceGraphKey]);
    this.#graphHeadInternals.shadowTargetToRealTargetMap.set(shadowTarget, objectInSourceGraph);
    this.#graphHeadInternals.realTargetToOriginGraph.set(objectInSourceGraph, sourceGraphKey);
    this.#graphHeadInternals.weakProxySet.add(proxy);

    return proxy;
  }

  // ObjectGraphValuesIfc
  public isKnownProxy(
    value: object
  ): boolean
  {
    return this.#graphHeadInternals.weakProxySet!.has(value);
  }

  // ObjectGraphHeadIfc
  public revokeAllProxiesForGraph(
    graphKey: string | symbol
  ): void
  {
    if (this.#graphHeadInternals.revoked)
      throw new Error("This object graph has been revoked");

    this.#graphHeadInternals.keyedRevokerSets.revokeSet(graphKey);

    if (graphKey === this.objectGraphKey) {
      this.#graphHeadInternals = new RevokedGraphHeadInternals();
    }
  }

  // ObjectGraphConversionIfc
  public getRealTargetForShadowTarget(
    shadowTarget: object
  ): object
  {
    if (this.#graphHeadInternals.revoked)
      throw new Error("This object graph has been revoked");
    return this.#graphHeadInternals.shadowTargetToRealTargetMap.get(shadowTarget)!;
  }

  // ObjectGraphConversionIfc
  public getTargetGraphKeyForRealTarget(
    realTarget: object
  ): string | symbol
  {
    if (this.#graphHeadInternals.revoked)
      throw new Error("This object graph has been revoked");
    return this.#graphHeadInternals.realTargetToOriginGraph.get(realTarget)!;
  }
}
