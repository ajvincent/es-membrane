/**
 * @fileoverview
 *
 * This is the ProxyHandler for converting from one ObjectGraph to another.
 */

import {
  NWNCDataDescriptor,
  assert,
  getRealTarget,
} from "../core/utilities/shared.mjs";

import {
  LinkedListNode
} from "./LinkedList.mjs";

/**
 * Build a LinkedListNode specifically for tracing entering and exiting a proxy handler.
 *
 * @param objectGraph {ObjectGraph} The object graph from a Membrane.
 * @param name        {String}      The name of this particular node in the linked list.
 * @param traceLog    {String[]}    Where the tracing will be recorded.
 *
 * @constructor
 * @extends LinkedListNode
 */
export default class GraphWrapping extends LinkedListNode {
  constructor(objectGraph, name) {
    super(objectGraph, name);

    Reflect.defineProperty(this, "membrane", new NWNCDataDescriptor(objectGraph.membrane));
  }

  getPrototypeOf(shadowTarget) {
    //this.validateTrapAndShadowTarget("getPrototypeOf", shadowTarget);

    /* Prototype objects are special in JavaScript, but with proxies there is a
     * major drawback.  If the prototype property of a function is
     * non-configurable on the proxy target, the proxy is required to return the
     * proxy target's actual prototype property instead of a wrapper.  You might
     * think "just store the wrapped prototype on the shadow target," and maybe
     * that would work.
     *
     * The trouble arises when you have multiple objects sharing the same
     * prototype object (either through .prototype on functions or through
     * Reflect.getPrototypeOf on ordinary objects).  Some of them may be frozen,
     * others may be sealed, still others not.  The point is .getPrototypeOf()
     * doesn't have a non-configurability requirement to exactly match the way
     * the .prototype property lookup does.
     *
     * It's also for this reason that getPrototypeOf and setPrototypeOf were
     * completely rewritten to more directly use the real prototype chain.
     *
     * One more thing:  it is a relatively safe practice to use a proxy to add,
     * remove or modify individual properties, and ModifyRulesAPI.js supports
     * that in several flavors.  It is doable, but NOT safe, to alter the
     * prototype chain in such a way that breaks the perfect mirroring between
     * object graphs.  Thus, this membrane code will never directly support that
     * as an option.  If you really insist, you should look at creating your own
     * LinkedListNode with a custom getPrototypeOf trap and inserting it.
     *
     * XXX ajvincent update this comment after fixing #76 to specify how the
     * user will extract the shadow target.
     */
    const target = getRealTarget(shadowTarget);
    const cylinder = this.membrane.cylinderMap.get(target);

    try {
      /* XXX ajvincent FIXME How do we convert from
       * ProxyHandler.getPrototypeOf(shadowTarget) to Reflect.getPrototypeOf(target)?
       */
      const proto = this.nextHandler(shadowTarget).getPrototypeOf(shadowTarget);
      let proxy;
      if (cylinder.originGraph !== this.graphName)
        proxy = this.membrane.convertArgumentToProxy(
          this.membrane.getHandlerByName(cylinder.originGraph),
          this.objectGraph,
          proto
        );
      else
        proxy = proto;

      let protoCylinder = this.membrane.cylinderMap.get(proxy);
      if (protoCylinder && (protoCylinder.originGraph !== this.objectGraph.graphName)) {
        assert(Reflect.setPrototypeOf(shadowTarget, proxy),
               "shadowTarget could not receive prototype?");
      }
      return proxy;
    }
    catch (e) {
      if (this.membrane.__mayLog__()) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }
}
