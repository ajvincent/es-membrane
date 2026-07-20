import type {
  MembraneInternalIfc
} from "#objectgraph_handlers/source/types/MembraneInternalIfc.js";

import type {
  ObjectGraphHeadIfc
} from "#objectgraph_handlers/source/types/ObjectGraphHeadIfc.js";

export default class MockMembrane implements MembraneInternalIfc
{
  readonly #proxyToSourceGraphMap = new WeakMap<object, string | symbol>;
  readonly #graphHeadMap = new Map<string | symbol, ObjectGraphHeadIfc>;

  registerGraphhead(graphHead: ObjectGraphHeadIfc): void {
    this.#graphHeadMap.set(graphHead.objectGraphKey, graphHead);
  }

  public convertValue<ValueType>
  (
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    value: ValueType
  ): ValueType
  {
    return this.#graphHeadMap.get(targetGraphKey)!.getValueInGraph(value, sourceGraphKey) as ValueType;
  }

  public convertArray<
    ValueTypes extends unknown[]
  >
  (
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    values: ValueTypes
  ): ValueTypes
  {
    return values.slice() as ValueTypes;
  }

  public convertDescriptor(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor
  {
    void sourceGraphKey;
    void targetGraphKey;
    void descriptor;
    throw new Error("Function not implemented.");
  }

  public notifyNewProxy(
    targetProxy: object,
    sourceGraph: string | symbol
  ): void
  {
    this.#proxyToSourceGraphMap.set(targetProxy, sourceGraph);
  }

  public getOriginGraph(
    targetValue: object
  ): string | symbol | undefined
  {
    return this.#proxyToSourceGraphMap.get(targetValue);
  }

  public notifyAssertionFailed(
    targetGraphKey: string | symbol
  ): void
  {
    void targetGraphKey;
    throw new Error("Method not implemented.");
  }
};
