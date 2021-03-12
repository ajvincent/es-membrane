import ProxyMessage from "./ProxyMessage.mjs";

/**
 * @package
 */
export default class ProxyBroadcaster extends Set {
  constructor(graph) {
    super();
    this.graph = graph;
  }

  broadcast(proxy, realTarget, isOrigin) {
    if (this.size === 0)
      return;
    const message = new ProxyMessage(proxy, realTarget, this.graph, isOrigin);
    const listeners = Array.from(this);

    listeners.every(listener => {
      try {
        listener(message);
      }
      catch (e) {
        if (message.logger) {
          /* We don't want an accidental exception to break the iteration.
          That's why the throwException() method exists:  a deliberate call means
          yes, we really want that exception to propagate outward... which is
          still nasty when you consider what a membrane is for.
          */
          try {
            message.logger.error(e);
          }
          catch (f) {
            // really do nothing, there's no point
          }
        }
      }

      return !message.stopped;
    });

    if (message.exceptionFound)
      throw message.exception;

    message.stopIteration();
  }
}
