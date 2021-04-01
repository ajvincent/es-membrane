/** @module source/core/broadcasters/ProxyMessage  */

import {
  defineNWNCProperties,
} from "../utilities/shared.mjs";
import ProxyMessageBase from "./ProxyMessageBase.mjs";

/**
 * @package
 */
export default class ProxyInitMessage extends ProxyMessageBase {
  /**
   *
   * @param {Proxy}                            proxy
   * @param {Object}                           realTarget
   * @param {ObjectGraph | ObjectGraphHandler} graph
   * @param {boolean}                          isOriginGraph
   */
  constructor(proxy, realTarget, graph, isOriginGraph) {
    super();
    defineNWNCProperties(this, {
      /** @public */
      proxy,

      /** @public */
      realTarget,

      /** @public */
      graph,

      /** @public */
      isOriginGraph,

      /** @public */
      logger: (graph.membrane && (typeof graph.membrane.logger !== "undefined") ?
               graph.membrane.logger :
               null)
    }, true);
  }
}

Object.freeze(ProxyInitMessage);
Object.freeze(ProxyInitMessage.prototype);
