import type {
  MembraneInternalIfc
} from "#objectgraph_handlers/source/types/MembraneInternalIfc.js";

export default class MockMembrane implements MembraneInternalIfc
{
  convertArray<
    ValueTypes extends unknown[]
  >
  (
    targetGraphKey: string | symbol,
    values: ValueTypes
  ): ValueTypes
  {
    return values.slice() as ValueTypes;
  }

  convertDescriptor(
    targetGraphKey: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor
  {
    throw new Error("Function not implemented.");
  }

  notifyAssertionFailed(
    targetGraphKey: string | symbol
  ): void
  {
    throw new Error("Method not implemented.");
  }
};
