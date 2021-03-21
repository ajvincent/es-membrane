/**
 * @fileoverview
 *
 * This is for specifically converting the shadow target to a real target, for
 * directly applying to Reflect traps.
 */

import { LinkedListNode } from "./LinkedList.mjs";
import {
  NWNCDataDescriptor,
  allTraps,
  getRealTarget,
} from "../core/utilities/shared.mjs";

/**
 * Build a LinkedListNode for passing real targets to Reflect.
 *
 * @param objectGraph {ObjectGraph} The object graph from a Membrane.
 * @param name        {String}      The name of this particular node in the linked list.
 * @param traceLog    {String[]}    Where the tracing will be recorded.
 */

export default class ConvertFromShadow extends LinkedListNode {
  constructor(objectGraph, name) {
    super(objectGraph, name);
    Object.freeze(this);
  }
}

/**
 * ProxyHandler implementation
 */
allTraps.forEach((trapName) => {
  const trap = function(...args) {
    const shadowTarget = args[0];
    args.splice(0, 1, getRealTarget(shadowTarget));
    const next = this.nextHandler(shadowTarget);
    return next[trapName].apply(next, args);
  };
  Reflect.defineProperty(
    ConvertFromShadow.prototype,
    trapName,
    new NWNCDataDescriptor(trap)
  );
})

Object.freeze(ConvertFromShadow.prototype);
Object.freeze(ConvertFromShadow);
