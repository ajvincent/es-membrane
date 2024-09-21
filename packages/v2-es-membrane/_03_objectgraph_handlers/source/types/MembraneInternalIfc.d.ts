/* This API may change depending on needs from future components. */

export interface MembraneInternalIfc
{
  convertArray<ValueTypes extends unknown[]>(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    values: ValueTypes
  ) : ValueTypes;

  convertDescriptor(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    descriptor: PropertyDescriptor | undefined,
  ): PropertyDescriptor | undefined;

  notifyAssertionFailed(
    targetGraphKey: string | symbol,
  ): void;
}
