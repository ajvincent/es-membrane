import {
  defineNWNCProperties,
  valueType
} from "./utilities/shared.mjs";

/**
 * @package
 */
export default class PassThroughManager {
  constructor(membranePassThrough) {
    if (typeof membranePassThrough !== "function")
      throw new Error("filter must be a function!");

    defineNWNCProperties(this, {
      /**
       * @type {Function}
       * @private
       */
      membranePassThrough,

      /**
       * @type {WeakSet<Object>}
       * @private
       */
      alreadyPassed: new WeakSet,

      /**
       * @type {WeakSet<Object>}
       * @private
       */
      alreadyRejected: new WeakSet,

      /**
       * @type {WeakMap<ObjectGraph, Function>}
       * @private
       */
      graphPassThrough: new WeakMap,
    }, false);

    Object.freeze(this);
  }

  /**
   *
   * @param {ObjectGraph} graph   The object graph.
   * @param {Function}    filter  The passThrough function.
   *
   * @public
   */
  addGraph(graph, filter) {
    if (this.graphPassThrough.has(graph))
      throw new Error("This graph has already been registered!");
    if (typeof filter !== "function")
      throw new Error("filter must be a function!");

    this.graphPassThrough.set(graph, filter);
  }

  /**
   *
   * @param {Object} value
   * @param {ObjectGraph} originGraph
   * @param {ObjectGraph} targetGraph
   *
   * @returns {boolean}
   * @public
   */
  mayPass(value, originGraph, targetGraph) {
    if (valueType(value) === "primitive" || this.alreadyPassed.has(value))
      return true;
    if (this.alreadyRejected.has(value))
      return false;

    if (this.membranePassThrough(value) ||
        (this.graphPassThrough.get(originGraph)(value) &&
         this.graphPassThrough.get(targetGraph)(value))) {
      this.alreadyPassed.add(value);
      return true;
    }

    this.alreadyRejected.add(value);
    return false;
  }

  /**
   * @param {Object} value
   * @public
   */
  mustPass(value) {
    this.throwIfKnown(value);
    this.alreadyPassed.add(value);
  }

  /**
   * @param {Object} value
   * @public
   */
  mustBlock(value) {
    this.throwIfKnown(value);
    this.alreadyRejected.add(value);
  }

  /**
   * @param {Object} value
   * @public
   */
  forget(value) {
    this.alreadyPassed.delete(value);
    this.alreadyRejected.delete(value);
  }

  /**
   * @param {Object} value
   * @private
   */
  throwIfKnown(value) {
    if (valueType(value) === "primitive")
      throw new Error("Primitives already pass through!");
    if (this.alreadyPassed.has(value))
      throw new Error("This value already passes through!");
    if (this.alreadyRejected.has(value))
      throw new Error("This value already does not pass through!");
  }
}

Object.freeze(PassThroughManager);
Object.freeze(PassThroughManager.prototype);
