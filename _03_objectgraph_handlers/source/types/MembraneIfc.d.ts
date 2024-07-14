/* This API may change depending on needs from future components. */

import type {
  RequiredProxyHandler
} from "./RequiredProxyHandler.js";

export interface MembraneIfc
{
  convertArray<ValueTypes extends unknown[]>(
    targetGraphKey: string | symbol,
    values: ValueTypes
  ) : ValueTypes;

  convertDescriptor(
    targetGraphKey: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor;

  /**
   * This returns `Reflect`. or in rare cases, an `ObjectGraphHead`.
   * @param targetGraph
   * @param target - the real target from the
   */
  getHandlerForTarget(
    targetGraphKey: string | symbol,
    target: object
  ): RequiredProxyHandler
}
