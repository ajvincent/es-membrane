import { MembraneInternalIfc } from "#objectgraph_handlers/source/types/MembraneInternalIfc.js";

export default
class MirrorMembrane implements MembraneInternalIfc
{
  convertArray<
    ValueTypes extends unknown[]
  >
  (
    targetGraphKey: string | symbol,
    values: ValueTypes
  ): ValueTypes
  {
    throw new Error("Method not implemented.");
  }

  convertDescriptor(
    targetGraphKey: string | symbol,
    descriptor: PropertyDescriptor | undefined
  ): PropertyDescriptor | undefined
  {
    throw new Error("Method not implemented.");
  }

  notifyAssertionFailed(
    targetGraphKey: string | symbol
  ): void
  {
    throw new Error("Method not implemented.");
  }
}
