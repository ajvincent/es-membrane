/** @module source/ProxyHandlers/IfThen.mjs */

import LinkedListHandler from "./LinkedList.mjs";
import JumpHandler from "./Jump.mjs";

import {
  defineNWNCProperties,
} from "../core/utilities/shared.mjs";


/**
 * This is a special LinkedListHandler which allows redirecting to other
 * LinkedListHandler handlers.  If you provide this to a LinkedListManager,
 * it will use the conditions you provide to link from this handler to
 * the next handler for a shadow target.
 *
 * Each LinkedListHandler handler which the IfThenHandler tracks must be in
 * the LinkedListManager's sequence already, when you insert the IfThenHandler
 * into the manager's sequence, and they must be after the IfThenHandler.
 * This is to prevent loops.
 *
 * You definitely should implement traps on instances of IfThenHandler.
 * The defaultNext handler is simply what LinkedListManager will use for
 * invokeNextHandler().
 *
 * @public
 */
export class IfThenHandler extends JumpHandler {
  /**
   * @param {ObjectGraph} objectGraph
   * @param {LinkedListHandler | Reflect} defaultNext
   */
  constructor(objectGraph, defaultNext) {
    super(objectGraph, defaultNext);

    defineNWNCProperties(this, {
      /**
       * @type {Map<function, LinkedListHandler>}
       * @private
       */
      conditionToNodeMap: new Map,
    }, false);
  }

  /**
   * @returns {Iterator<LinkedListHandler | Reflect>}
   * @public
   */
  getConditionHandlers() {
    return this.conditionToNodeMap.values();
  }

  /**
   *
   * @param condition
   * @param handler
   *
   * @public
   */
  addCondition(condition, handler) {
    if (this.lockedForLinkedList)
      throw new Error("this IfThenNode is locked!");
    if (typeof condition !== "function")
      throw new Error("condition must be a function!");
    if ((handler !== Reflect) && !(handler instanceof LinkedListHandler))
      throw new Error("handler must be a LinkedListHandler proxy handler or Reflect!");
    if (this.conditionToNodeMap.has(condition))
      throw new Error("this IfThenNode already has the given condition");

    this.conditionToNodeMap.set(condition, handler);
  }

  /**
   * Determine the right ProxyHandler for a given target.
   *
   * @param {Object} shadowTarget
   *
   * @returns {LinkedListHandler | Reflect}
   * @public
   */
  getHandlerForTarget(shadowTarget) {
    if (!this.lockedForLinkedList)
      throw new Error("this IfThenNode is not locked!");

    for (let [condition, handler] of this.conditionToNodeMap.entries()) {
      try {
        if (condition(shadowTarget))
          return handler;
      }
      catch (ex) {
        // do nothing
      }
    }

    return this.defaultNext;
  }
}
