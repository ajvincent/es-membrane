/** @module source/core/broadcasters/ProxyBroadcaster  */

import FunctionSet from "../utilities/FunctionSet.mjs";
import ProxyInitMessage from "./ProxyInitMessage.mjs";

/**
 * @package
 */
export default class ProxyBroadcaster extends FunctionSet {
  constructor(graph) {
    super(
      (graph.membrane && (typeof graph.membrane.logger !== "undefined") ?
      e => {
        try {
          graph.membrane.logger.error(e)
        }
        catch (ex) {
          // do nothing
          void(ex);
        }
      } :
      "none")
    );
    this.graph = graph;
  }

  /**
   * @returns {boolean}
   * @override
   */
  add(listener) {
    if (typeof listener !== "function")
      return false;

    super.add(message => {
      if (!message.stopped)
        listener(message);
    });

    return true;
  }

  broadcast(proxy, realTarget, isOrigin) {
    if (this.size === 0)
      return;
    const message = new ProxyInitMessage(proxy, realTarget, this.graph, isOrigin);

    this.observe(message);

    if (message.exceptionFound)
      throw message.exception;

    message.stopIteration();
  }
}
