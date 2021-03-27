/**
 * @module source/ProxyHandlers/LinkedList.mjs
 *
 * @fileoverview
 *
 * This implements a LinkedList proxy handler and nodes for the linked list.
 *
 * LinkedListHandler objects should form the basis for any real-world proxy
 * operations, as a unit-testable component.
 *
 * @see Tracing.mjs for an example of how to write a LinkedListHandler subclass.
 */

import Base from "./Base.mjs";

import {
  defineNWNCProperties,
} from "../core/utilities/shared.mjs";

import NextHandlerMap from "../core/utilities/NextHandlerMap.mjs";

/**
 * @type {WeakSet<LinkedListHandler>}
 * @private
 */
const LockedSet = new WeakSet();

/**
 * @public
 */
export default class LinkedListHandler extends Base {
  constructor(objectGraph) {
    super();
    defineNWNCProperties(this, {
      /**
       * @public
       */
      objectGraph,
    }, true);

    defineNWNCProperties(this, {
      /**
       * @package
       */
      nextHandlerMap: new NextHandlerMap,
    }, false);
  }

  get lockedForLinkedList() {
    return LockedSet.has(this);
  }

  set lockedForLinkedList(val) {
    if (val)
      LockedSet.add(this);
  }

  /**
   *
   * @param {string} trapName
   * @param {Object} shadowTarget
   * @param {void[]} args
   *
   * @returns {void}
   * @public
   */
  invokeNextHandler(trapName, shadowTarget, ...args) {
    return this.nextHandlerMap.invokeNextHandler(trapName, shadowTarget, ...args);
  }
}
Object.freeze(LinkedListHandler);
Object.freeze(LinkedListHandler.prototype);
