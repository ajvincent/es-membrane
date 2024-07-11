/* This API may change depending on needs from future components. */

import type {
  RequiredProxyHandler
} from "./RequiredProxyHandler.js";

export interface ObjectGraphStub
{
  getNextTargetForShadow(shadowTarget: object) : object;
  getHandlerForTarget(target: object) : RequiredHandler;
  convertArguments(...args: unknown[]) : unknown[];
  convertDescriptor(descriptor: PropertyDescriptor): PropertyDescriptor;
}
