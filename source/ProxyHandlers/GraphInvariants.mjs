import {
  allTraps,
  valueType,
} from "../core/utilities/shared.mjs";
import { LinkedListNode } from "./LinkedList-old.mjs";

class InvariantBase extends LinkedListNode {
  validateArgument(arg, argIndex) {
    if (valueType(arg) === "primitive")
      return;
    if (this.membrane.getMembraneProxy(this.objectGraph.graphName, arg) === arg)
      return;
    if (argIndex === -1)
      throw new TypeError(`GraphInvariant violation for return value`);
    throw new TypeError(`GraphInvariant violation for argument ${argIndex}`);
  }
}
Object.freeze(InvariantBase.prototype);
Object.freeze(InvariantBase);

export class GraphInvariantOut extends InvariantBase {}

allTraps.forEach(function(trapName) {
  this[trapName] = function(target) {
    const rv = this.nextHandler(target)[trapName].apply(this, arguments);
    this.validateArgument(rv, -1);
    return rv;
  };
}, GraphInvariantOut);


export class GraphInvariantIn extends InvariantBase {}

allTraps.forEach(function(trapName) {
  this[trapName] = function(target) {
    Array.from(arguments).forEach(this.validateArgument, this);
    return this.nextHandler(target)[trapName].apply(this.nextHandler, arguments);
  };
}, GraphInvariantIn.prototype);
