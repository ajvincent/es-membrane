/** @module source/ProxyHandlers/Jump.mjs */

import LinkedListHandler from "./LinkedList.mjs";

import {
  defineNWNCProperties,
} from "../core/utilities/shared.mjs";

/**
 * This is a special LinkedListHandler which explicitly names the next handler
 * for the linked list.  Think of this as a "goto" command.  If you provide
 * this to a LinkedListManager, it will use this to link from this handler
 * to the next handler for all shadow targets.
 *
 * Each LinkedListHandler handler which the JumpHandler tracks must be in
 * the LinkedListManager's sequence already, when you insert the JumpHandler
 * into the manager's sequence, and they must be after the JumpHandler.
 * This is to prevent loops.
 *
 * You definitely should implement traps on instances of JumpHandler.
 * The defaultNext handler is simply what LinkedListManager will use for
 * invokeNextHandler().
 *
 * @public
 */
export default class JumpHandler extends LinkedListHandler {
  constructor(objectGraph, defaultNext) {
    super(objectGraph);

    if ((defaultNext !== Reflect) && !(defaultNext instanceof LinkedListHandler))
      throw new Error("handler must be a LinkedListHandler proxy handler or Reflect!");

    defineNWNCProperties(this, {
      /**
       * @public
       */
      defaultNext,
    }, false);
  }
}
