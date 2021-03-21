/**
 * @fileoverview
 *
 * This is a debugging ProxyHandler. Production code shouldn't use this, but if
 * you need to figure out how you're getting in and out of a particular
 * ProxyHandler, this is useful.
 */

import { LinkedListNode } from "./LinkedList.mjs";
import {
  DataDescriptor,
  allTraps,
} from "../core/utilities/shared.mjs";

/**
 * @private
 */
const withProps = new Set([
  "defineProperty",
  "deleteProperty",
  "get",
  "getOwnPropertyDescriptor",
  "has",
  "set",
]);

/**
 * Build a LinkedListNode specifically for tracing entering and exiting a proxy handler.
 *
 * @param objectGraph {ObjectGraph} The object graph from a Membrane.
 * @param name        {String}      The name of this particular node in the linked list.
 * @param traceLog    {String[]}    Where the tracing will be recorded.
 */
export default class Tracing extends LinkedListNode {
  constructor(objectGraph, name, traceLog = []) {
    super(objectGraph, name);
    this.traceLog = traceLog;

    //Object.seal(this);
  }

  /**
   * Clear the current log of events.
   */
  clearLog() {
    this.traceLog.splice(0, this.traceLog.length);
  }
}

/**
 * ProxyHandler implementation
 */
allTraps.forEach((trapName) => {
  const trap = function(...args) {
    const target = args[0];
    let msg;
    {
      let names = [this.name, trapName];
      if (withProps.has(trapName))
        names.push(args[1].toString());
      msg = names.join(", ");
    }

    this.traceLog.push(`enter ${msg}`);
    try {
      const next = this.nextHandler(target);
      let rv = next[trapName].apply(next, args);
      this.traceLog.push(`leave ${msg}`);
      return rv;
    }
    catch (ex) {
      this.traceLog.push(`throw ${msg}`);
      throw ex;
    }
  };

  Reflect.defineProperty(
    Tracing.prototype,
    trapName,
    new DataDescriptor(trap)
  );
});
