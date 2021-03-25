/**
 * @fileoverview
 *
 * This implements a LinkedList proxy handler and nodes for the linked list.
 *
 * LinkedListNode objects should form the basis for any real-world proxy
 * operations, as a unit-testable component.
 *
 * @see Tracing.mjs for an example of how to write a LinkedListNode subclass.
 *
 * This file relies on a special trick about proxy handlers, specifically those when the underlying
 * ECMAScript engine executes their traps.  The traps only receive arguments from the engine which
 * the ECMA-262 specification defines.
 *
 * So if we add any new arguments for internal use, say, an array of subsequent ProxyHandlers,
 * and each one calls the next in sequence, and the last is Reflect, we only need to look up on
 * a WeakMap for a shadow target to get the sequence of ProxyHandlers and pass it in.
 *
 */

import Base from "./Base.mjs";

import {
  allTraps,
  defineNWNCProperties,
  getRealTarget,
} from "../core/utilities/shared.mjs";

/**
 * @type WeakMap<(LinkedListHeadNode | ShadowTarget), (LinkedListNode | Reflect)[]>
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
class LinkedListNode extends Base {
  constructor(objectGraph) {
    super();
    defineNWNCProperties(this, {
      /**
       * @package
       */
      objectGraph,
    }, false);
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
class LinkedListHeadNode extends LinkedListNode {
  constructor(objectGraph) {
    super(objectGraph, false);
    Object.freeze(this);
  }
}
allTraps.forEach(trapName => {
  Reflect.defineProperty(
    LinkedListHeadNode.prototype,
    trapName,
    function(shadowTarget, ...args) {
      let handlerArray = LinkedListMap.get(shadowTarget);
      if (!handlerArray)
        handlerArray = LinkedListMap.get(this);
      handlerArray = handlerArray.slice();
      args.push(handlerArray);

      const nextHandler = handlerArray.shift();
      return nextHandler[trapName](shadowTarget, ...args);
    }
  );
});
Object.freeze(LinkedListHeadNode);
Object.freeze(LinkedListHeadNode.prototype);

export class LinkedListNodeWrapping extends LinkedListNode {
  constructor(objectGraph, actualHandler) {
    super(objectGraph);
    if (!(actualHandler instanceof Base))
      throw new Error("actualHandler must be a ProxyHandler!");

    defineNWNCProperties(this, { actualHandler }, false);

    this.nextHandler = null;
  }
}
{
  const traps = allTraps.map(trapName => function(...args) {
    if (this.nextHandler) {
      return this.actualHandler[trapName].apply(this, args);
    }

    const remainingHandlers = args[Reflect[trapName].length];
    this.nextHandler = remainingHandlers.shift();

    try {
      return this.actualHandler[trapName].apply(this, args);
    }
    finally {
      this.nextHandler = null;
    }
  });

  defineNWNCProperties(LinkedListNodeWrapping.prototype, traps, true);
}
Object.freeze(LinkedListNodeWrapping);
Object.freeze(LinkedListNodeWrapping.prototype);

/**
 * @package
 */
export class LinkedListManager {
  constructor(objectGraph) {
    const head = new LinkedListHeadNode(objectGraph);

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
      denyPrependSet: new Set(),
    }, false);

    Object.freeze(this);
    LinkedListMap.set(head, [Reflect]);
  }

  /**
   * @public
   */
  preventInsertBeforeReflect() {
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
    const sequence = LinkedListMap.get(shadowTargetOrHead);
    if (!sequence)
      throw new Error("No sequence exists for this shadow target!");
    Object.freeze(sequence);
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
    if (!sequence)
      throw new Error("No sequence exists for this shadow target!");
    return sequence.slice();
  }

  /**
   *
   * @param preventInsertBefore
   * @param newHandler
   * @param currentHandler
   * @param shadowTargetOrHead
   *
   * @public
   */
  insertBefore(preventInsertBefore, newHandler, currentHandler = Reflect, shadowTargetOrHead = this.head) {
    if (typeof preventInsertBefore !== "boolean")
      throw new Error("preventInsertBefore must be a boolean!");

    if (!(newHandler instanceof LinkedListNodeWrapping))
      throw new Error("newHandler must be a LinkedListNodeWrapping!");

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
    if (preventInsertBefore)
      this.denyPrependSet.add(newHandler);
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

    const sequence = LinkedListMap.get(shadowTarget) || LinkedListMap.get(this.head);
    Object.freeze(sequence);

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
