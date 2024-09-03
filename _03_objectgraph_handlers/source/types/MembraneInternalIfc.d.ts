/* This API may change depending on needs from future components. */

import type {
  RequiredProxyHandler
} from "./RequiredProxyHandler.js";

export interface MembraneInternalIfc
{
  convertArray<ValueTypes extends unknown[]>(
    targetGraphKey: string | symbol,
    values: ValueTypes
  ) : ValueTypes;

  convertDescriptor(
    targetGraphKey: string | symbol,
    descriptor: PropertyDescriptor | undefined,
  ): PropertyDescriptor | undefined;

  notifyAssertionFailed(
    targetGraphKey: string | symbol,
  ): void;
}
