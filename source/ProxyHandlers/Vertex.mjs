import Base from "./Base.mjs";

import {
  defineNWNCProperties,
} from "../core/utilities/shared.mjs";

import NextHandlerMap from "../core/utilities/NextHandlerMap.mjs";

export default class VertexHandler extends Base {
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

    this.__handlerGraph__ = null;
  }

  /**
   * @package
   */
  get handlerGraph() {
    return this.__handlerGraph__;
  }

  /**
   * @package
   */
  set handlerGraph(graph) {
    if (this.__handlerGraph__)
      throw new Error("We already have a proxy handler graph!");
    this.__handlerGraph__ = graph;
  }
}
