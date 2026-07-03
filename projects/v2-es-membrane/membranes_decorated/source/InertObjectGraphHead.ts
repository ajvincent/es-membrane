import type {
  ObjectGraphHeadIfc
} from "#objectgraph_handlers/source/types/ObjectGraphHeadIfc.js";

export class InertObjectGraphHead implements ObjectGraphHeadIfc {
  readonly objectGraphKey: string | symbol;

  constructor(objectGraphKey: string | symbol)
  {
    this.objectGraphKey = objectGraphKey;
  }

  get isRevoked(): boolean {
    return true;
  }

  revokeAllProxiesForGraph(
    graphKey: string | symbol
  ): void
  {
    // this is explicitly permitted as a safe operation
    void graphKey;
  }

  getArrayInGraph<
    Elements extends unknown[] = unknown[]
  >
  (
    valuesInSourceGraph: Elements,
    sourceGraphKey: string | symbol
  ): Elements
  {
    void valuesInSourceGraph;
    void sourceGraphKey;
    throw new Error("Method not implemented.");
  }

  getDescriptorInGraph<T>(
    descriptorInSourceGraph: TypedPropertyDescriptor<T> | undefined,
    sourceGraphKey: string | symbol
  ): TypedPropertyDescriptor<T> | undefined
  {
    void descriptorInSourceGraph;
    void sourceGraphKey;
    throw new Error("Method not implemented.");
  }

  getValueInGraph(
    valueInSourceGraph: unknown,
    sourceGraphKey: string | symbol
  ): unknown
  {
    void valueInSourceGraph;
    void sourceGraphKey;
    throw new Error("Method not implemented.");
  }

  isKnownProxy(
    value: object
  ): boolean
  {
    void value;
    return false;
  }
}
