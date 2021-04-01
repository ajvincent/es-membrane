/** @module source/ProxyHandlers/utilities/HandlerGraph.mjs */

/**
 * @fileoverview
 *
 * A ProxyHandlerGraph is a simple directed graph of ProxyHandler objects.  This
 * graph describes all the possible proxy handlers for the proxies of a membrane
 * object graph, and how we might get from one to another.
 *
 *
 */

import {
  DataDescriptor,
  defineNWNCProperties,
  makeShadowTarget,
} from "../../core/utilities/shared.mjs";

import VertexHandler from "../Vertex.mjs";

function returnTrue() {
  return true;
}

/**
 * @type {WeakSet<ShadowTarget>}
 * @private
 */
const DirtyTargets = new WeakSet;

/** @private */
class HandlerMetadata {
  super(isTransient) {
    this.isTransient = isTransient;
    this.targetVertices = new WeakSet();
    this.hasReturnTrue = false;
  }
}

class GraphHeadVertex extends VertexHandler {
  constructor(objectGraph) {
    super(objectGraph);
  }
}

export default class ProxyHandlerGraph {
  constructor(objectGraph) {
    defineNWNCProperties(this, {
      /**
       * @type {Map<ProxyHandler, HandlerMetadata>}
       * @private
       */
      __vertices__: new Map,

      /**
       * @type {Map<ProxyHandler, WeakMap<Function, ProxyHandler>>}
       * @private
       */
      __directedEdges__: new Map,

      /**
       * @type {GraphHeadVertex}
       * @private
       */
      __head__: new GraphHeadVertex(objectGraph),
    }, false);

    /**
     * @private
     */
    Reflect.defineProperty(
      this,
      "__locked__",
      new DataDescriptor(false, true, false, false)
    );

    this.__vertices__.set(Reflect, new HandlerMetadata(false));
  }

  /**
   * Add a ProxyHandler as a vertex.
   * @param {VertexHandler} vertex      The proxy handler to add.
   * @param {boolean}       isTransient True if the proxy handler can be dropped for a shadow target after
   *                                    its first invocation.
   */
  addVertex(vertex, isTransient = false) {
    this.throwIfLocked();
    if (this.__vertices__.has(vertex))
      throw new Error("Proxy handler is already in this graph!");
    if (!(vertex instanceof VertexHandler))
      throw new Error("Vertex must be a VertexHandler instance!");

    this.__vertices__.set(vertex, new HandlerMetadata(isTransient));
  }

  /**
   * 
   * @param {ProxyHandler} sourceHandler
   * @param {ProxyHandler} targetHandler
   * @param {Function}     condition     A filter to determine if the edge applies and disqualifies all other edges.
   *
   * @public
   */
  addDirectedEdge(sourceHandler, targetHandler, condition = returnTrue) {
    this.throwIfLocked();
    if (sourceHandler === Reflect)
      throw new Error("Source handler is Reflect, which cannot invoke another proxy handler directly!");
    if (!this.__vertices__.has(sourceHandler))
      throw new Error("Source proxy handler is not in the graph!");
    if (!this.__vertices__.has(targetHandler))
      throw new Error("Target proxy handler is not in the graph!");
    if (typeof condition !== "function")
      throw new Error("Condition must be a function!");

    if (this.__vertices__.get(targetHandler).targetVertices.has(sourceHandler))
      throw new Error("A directed edge from the target handler to the source handler already exists!");

    const meta = this.__vertices__.get(sourceHandler);
    if (meta.hasReturnTrue)
      throw new Error("All conditions on the source handler's edges result in a target handler already!");

    meta.targetVertices.add(targetHandler);
    if (condition === returnTrue)
      meta.hasReturnTrue = true;

    if (!this.__directedEdges__.has(sourceHandler))
      this.__directedEdges__.set(sourceHandler, new WeakMap);

    this.__directedEdges__.get(sourceHandler).set(condition, targetHandler);
  }

  /**
   * @public
   */
  lock() {
    Reflect.defineProperty(this, "__locked__", { value: true, writable: false});
  }

  /**
   * @private
   */
  throwIfLocked() {
    if (this.__locked__)
      throw new Error("This ProxyHandlerGraph is locked!");
  }

  /**
   *
   * @param {Object} realTarget
   *
   * @returns {[proxy, function]}
   * @public
   */
  buildRevocableProxy(realTarget) {
    const shadowTarget = makeShadowTarget(realTarget);

    DirtyTargets.add(shadowTarget);

    const parts = Proxy.revocable(shadowTarget, this.__head__);
    parts.shadowTarget = shadowTarget;
    return parts;
  }
}
