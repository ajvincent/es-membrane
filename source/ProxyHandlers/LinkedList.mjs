/**
 * @fileoverview
 *
 * This implements a LinkedList proxy handler and nodes for the linked list.
 *
 * LinkedListNode objects should form the basis for any real-world proxy
 * operations, as a unit-testable component.
 *
 * @see Tracing.mjs for an example of how to write a LinkedListNode subclass.
 */

import Base from "./Base.mjs";

import {
  allTraps,
  defineNWNCProperties,
  getRealTarget,
} from "../core/utilities/shared.mjs";

import NextHandlerMap from "../core/utilities/NextHandlerMap.mjs";

/**
 * @type WeakMap<(LinkedListHead | ShadowTarget), (LinkedListNode | Reflect)[]>
 * @private
 */
const LinkedListMap = new WeakMap();

/**
 * @type WeakSet<ShadowTarget>
 * @private
 */
const ProxiesCreated = new WeakSet();

/**
 * @public
 */
export class LinkedListNode extends Base {
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
Object.freeze(LinkedListNode);
Object.freeze(LinkedListNode.prototype);

/**
 * @private
 *
 * @note This is deliberately not exported, as I don't want customers to
 * manipulate the head node, which is where proxies start.
 */
class LinkedListHead extends Base {
  constructor() {
    super();
    Object.freeze(this);
  }
}
allTraps.forEach(trapName => {
  Reflect.defineProperty(
    LinkedListHead.prototype,
    trapName,
    function(shadowTarget, ...args) {
      let handlerArray = LinkedListMap.get(shadowTarget);
      if (!handlerArray)
        handlerArray = LinkedListMap.get(this);
      handlerArray = handlerArray.slice();

      const nextHandler = handlerArray.shift();
      return nextHandler[trapName](shadowTarget, ...args);
    }
  );
});
Object.freeze(LinkedListHead);
Object.freeze(LinkedListHead.prototype);

/**
 * @public
 */
export class LinkedListManager {
  constructor(objectGraph) {
    const head = new LinkedListHead();

    defineNWNCProperties(this, {
      /**
       * @private
       */
      head,

      /**
       * @private
       */
      objectGraph,

      /**
       * @private
       */
      denyPrependSet: new Set([head]),
    }, false);

    Object.freeze(this);
    LinkedListMap.set(head, [Reflect]);
  }

  /**
   *
   * @param {boolean}                       mayInsertBefore
   * @param {LinkedListNode}                newHandler
   * @param {Reflect | LinkedListNode}      currentHandler
   * @param {ShadowTarget | LinkedListHead} shadowTargetOrHead
   *
   * @public
   */
  insertBefore(mayInsertBefore, newHandler, currentHandler = Reflect, shadowTargetOrHead = this.head) {
    if (typeof mayInsertBefore !== "boolean")
      throw new Error("mayInsertBefore must be a boolean!");

    if (!(newHandler instanceof LinkedListNode))
      throw new Error("newHandler must be a LinkedListNode!");

    if (newHandler.objectGraph !== this.objectGraph)
      throw new Error("newHandler must share the same object graph as the LinkedListManager!");

    if (this.denyPrependSet.has(currentHandler))
      throw new Error("No handler may be inserted immediately before the current handler!");

    if (shadowTargetOrHead !== this.head)
      this.requireShadowTarget(shadowTargetOrHead, true);

    const sequence = LinkedListMap.get(shadowTargetOrHead);
    if (!sequence)
      throw new Error("No sequence of LinkedListNode objects recorded for target!  (Call this.cloneSequence() first?)");

    if (Object.isFrozen(sequence))
      throw new Error("Sequence of LinkedListNode objects is locked!");

    const index = sequence.indexOf(currentHandler);
    if (index === -1)
      throw new Error("Current handler not found in sequence of LinkedListNode objects!");

    sequence.splice(index, 0, newHandler);
    if (!mayInsertBefore)
      this.denyPrependSet.add(newHandler);
  }

  /**
   * 
   * @param {ProxyHandler} handler
   * @param {ShadowTarget | LinkedListHead} shadowTargetOrHead
   *
   * @returns {boolean}
   * @public
   */
  canInsertBefore(handler, shadowTargetOrHead = this.head) {
    const sequence = LinkedListMap.get(shadowTargetOrHead);
    if (!sequence)
      throw new Error("No sequence of LinkedListNode objects recorded for target!  (Call this.cloneSequence() first?)");

    const index = sequence.indexOf(handler);
    if (index === -1)
      throw new Error("Current handler not found in sequence of LinkedListNode objects!");

    return !Object.isFrozen(sequence) && !this.denyPrependSet.has(handler);
  }

  /**
   *
   * @param shadowTargetOrHead
   *
   * @returns {LinkedListNode[]}
   * @public
   */
  getSequence(shadowTargetOrHead = this.head) {
    if (shadowTargetOrHead !== this.head)
      this.requireShadowTarget(shadowTargetOrHead, true);
    const sequence = LinkedListMap.get(shadowTargetOrHead);
    return sequence ? sequence.slice() : null;
  }

  /**
   * @public
   */
  denyInsertBeforeReflect() {
    this.denyPrependSet.add(Reflect);
  }

  /**
   *
   * @param shadowTarget
   *
   * @returns {LinkedListNode[]}
   * @public
   */
  cloneSequence(shadowTarget) {
    this.requireShadowTarget(false);
    if (LinkedListMap.has(shadowTarget))
      throw new Error("A sequence already exists for this shadow target!");
    if (ProxiesCreated.has(shadowTarget))
      throw new Error("You already have a Proxy for this target!");
    const sequence = LinkedListMap.get(this.head).slice();
    LinkedListMap.set(shadowTarget, sequence);
    return sequence.slice();
  }

  /**
   *
   * @param shadowTargetOrHead
   * @public
   */
  lockSequence(shadowTargetOrHead = this.head) {
    if (shadowTargetOrHead !== this.head)
      this.requireShadowTarget(shadowTargetOrHead, true);
    let sequence = LinkedListMap.get(shadowTargetOrHead);
    if (!sequence)
      throw new Error("No sequence exists for this shadow target!");
    Object.freeze(sequence);

    // fill NextHandlerMap
    sequence = sequence.slice();
    const cache = new Map();
    do {
      const handler = sequence.pop();
      allTraps.forEach(trapName => {
        if (handler[trapName] === Base.prototype[trapName]) {
          return;
        }

        const cacheHandler = cache.get(trapName);
        if (cacheHandler) {
          NextHandlerMap.get(trapName).set(handler, cacheHandler);
        }

        cache.set(trapName, handler);
      });
    } while (sequence.length);

    allTraps.forEach(trapName => {
      NextHandlerMap.get(trapName).set(shadowTargetOrHead, cache.get(trapName));
    });
  }

  /**
   *
   * @param shadowTarget
   *
   * @returns {[proxy, function]}
   * @public
   */
  buildRevocableProxy(shadowTarget) {
    this.requireShadowTarget(shadowTarget);
    if (ProxiesCreated.has(shadowTarget))
      throw new Error("You already have a Proxy for this target!");
    ProxiesCreated.add(shadowTarget);

    this.lockSequence(this.head);
    if (LinkedListMap.has(shadowTarget))
      this.lockSequence(shadowTarget);

    return Proxy.revocable(shadowTarget, this.head);
  }

  /**
   *
   * @param shadowTarget
   * @param mayBeHead
   *
   * @private
   */
  requireShadowTarget(shadowTarget, mayBeHead = false) {
    if (getRealTarget(shadowTarget) === shadowTarget)
      throw new Error(`target is not a shadow target${mayBeHead ? " or linked list head" : ""}!`);
  }
}
Object.freeze(LinkedListManager);
Object.freeze(LinkedListManager.prototype);
