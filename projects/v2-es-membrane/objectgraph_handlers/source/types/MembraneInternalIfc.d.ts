/* This API may change depending on needs from future components. */

export interface MembraneInternalIfc
{
  convertValue<ValueType>(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    value: ValueType
  ): ValueType;

  convertArray<ValueTypes extends unknown[]>(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    values: ValueTypes
  ) : ValueTypes;

  convertDescriptor(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    descriptor: PropertyDescriptor | undefined,
  ): TypedPropertyDescriptor<unknown> | undefined;

  notifyAssertionFailed(
    targetGraphKey: string | symbol,
  ): void;
}
