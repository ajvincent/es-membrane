/* This API may change depending on needs from future components. */

import type {
  RequiredProxyHandler
} from "./RequiredProxyHandler.js";

export interface MembraneIfc
{
  convertArray(
    targetGraph: string | symbol,
    values: unknown[]
  ) : unknown[];

  convertDescriptor(
    targetGraph: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor;

  /**
   * This often returns `Reflect`.
   * @param targetGraph
   * @param target
   */
  getHandlerForTarget(
    targetGraph: string | symbol,
    target: object
  ): RequiredProxyHandler
}
