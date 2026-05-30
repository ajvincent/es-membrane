import type {
  MembraneInternalIfc
} from "#objectgraph_handlers/source/types/MembraneInternalIfc.js";

export default class MockMembrane implements MembraneInternalIfc
{
  convertArray<
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

  convertDescriptor(
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

  notifyAssertionFailed(
    targetGraphKey: string | symbol
  ): void
  {
    void targetGraphKey;
    throw new Error("Method not implemented.");
  }
};
