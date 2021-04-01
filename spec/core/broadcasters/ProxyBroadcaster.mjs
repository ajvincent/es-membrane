import ProxyInitMessage from "../../../source/core/broadcasters/ProxyInitMessage.mjs";
import ProxyBroadcaster from "../../../source/core/broadcasters/ProxyBroadcaster.mjs";

describe("ProxyBroadcaster", () => {
  let broadcaster;

  const graph = {
    membrane: {
      logger: {}
    }
  };

  beforeEach(() => {
    graph.membrane.logger.error = jasmine.createSpy("error");
    broadcaster = new ProxyBroadcaster(graph);
  })

  afterEach(() => {
    broadcaster = null;
    graph.membrane.logger.error = null;
  });

  it("is a Set of listeners", () => {
    expect(broadcaster instanceof Set).toBe(true);
  });

  describe(".broadcast()", () => {
    const proxy = {}, realTarget = {}, exception = {};
    let listener0, listener1, listener2;
    beforeEach(() => {
      listener0 = jasmine.createSpy("listener0");
      listener1 = jasmine.createSpy("listener1");
      listener2 = jasmine.createSpy("listener2");
    });

    function addListeners() {
      broadcaster.add(listener0);
      broadcaster.add(listener1);
      broadcaster.add(listener2);
    }

    it("invokes all listeners in order when none interrupt the operation", () => {
      addListeners();
      broadcaster.broadcast(proxy, realTarget, true);

      expect(listener0).toHaveBeenCalledTimes(1);
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      expect(listener0).toHaveBeenCalledBefore(listener1);
      expect(listener1).toHaveBeenCalledBefore(listener2);

      const args0 = listener0.calls.first().args;
      expect(args0.length).toBe(1);
      const message = args0[0];
      expect(message instanceof ProxyInitMessage).toBe(true);

      expect(listener1).toHaveBeenCalledOnceWith(message);
      expect(listener2).toHaveBeenCalledOnceWith(message);

      expect(message.proxy).toBe(proxy);
      expect(message.realTarget).toBe(realTarget);
      expect(message.graph).toBe(graph);
      expect(message.stopped).toBe(true);
      expect(message.exceptionFound).toBe(false);
      expect(message.exception).toBe(undefined);

      expect(graph.membrane.logger.error).toHaveBeenCalledTimes(0);
    });

    it("invokes all listeners up to a stopIteration call", () => {
      addListeners();

      listener1.and.callFake(message => message.stopIteration());

      broadcaster.broadcast(proxy, realTarget, true);

      expect(listener0).toHaveBeenCalledTimes(1);
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(0);

      expect(listener0).toHaveBeenCalledBefore(listener1);

      const args0 = listener0.calls.first().args;
      expect(args0.length).toBe(1);
      const message = args0[0];
      expect(message instanceof ProxyInitMessage).toBe(true);

      expect(listener1).toHaveBeenCalledOnceWith(message);

      expect(message.proxy).toBe(proxy);
      expect(message.realTarget).toBe(realTarget);
      expect(message.graph).toBe(graph);
      expect(message.stopped).toBe(true);
      expect(message.exceptionFound).toBe(false);
      expect(message.exception).toBe(undefined);

      expect(graph.membrane.logger.error).toHaveBeenCalledTimes(0);
    });

    it("invokes all listeners even if a listener throws an exception directly", () => {
      addListeners();

      listener1.and.throwError(exception);

      broadcaster.broadcast(proxy, realTarget, true);

      expect(listener0).toHaveBeenCalledTimes(1);
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      expect(listener0).toHaveBeenCalledBefore(listener1);
      expect(listener1).toHaveBeenCalledBefore(listener2);

      const args0 = listener0.calls.first().args;
      expect(args0.length).toBe(1);
      const message = args0[0];
      expect(message instanceof ProxyInitMessage).toBe(true);

      expect(listener1).toHaveBeenCalledOnceWith(message);
      expect(listener2).toHaveBeenCalledOnceWith(message);

      expect(message.proxy).toBe(proxy);
      expect(message.realTarget).toBe(realTarget);
      expect(message.graph).toBe(graph);
      expect(message.stopped).toBe(true);
      expect(message.exceptionFound).toBe(false);
      expect(message.exception).toBe(undefined);

      expect(graph.membrane.logger.error).toHaveBeenCalledOnceWith(exception);
    });

    it("invokes all listeners up to a throwException call", () => {
      addListeners();

      listener1.and.callFake(message => message.throwException(exception));

      expect(() => broadcaster.broadcast(proxy, realTarget, true)).toThrow(exception);

      expect(listener0).toHaveBeenCalledTimes(1);
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(0);

      expect(listener0).toHaveBeenCalledBefore(listener1);

      const args0 = listener0.calls.first().args;
      expect(args0.length).toBe(1);
      const message = args0[0];
      expect(message instanceof ProxyInitMessage).toBe(true);

      expect(listener1).toHaveBeenCalledOnceWith(message);

      expect(message.proxy).toBe(proxy);
      expect(message.realTarget).toBe(realTarget);
      expect(message.graph).toBe(graph);
      expect(message.stopped).toBe(true);
      expect(message.exceptionFound).toBe(true);
      expect(message.exception).toBe(exception);

      expect(graph.membrane.logger.error).toHaveBeenCalledTimes(0);
    });

    it("does not fail for a missing logger when a listener throws an exception directly", () => {
      const graph = {
        membrane: {}
      };
      broadcaster = new ProxyBroadcaster(graph);

      addListeners();

      listener1.and.throwError(exception);

      broadcaster.broadcast(proxy, realTarget, true);

      expect(listener0).toHaveBeenCalledTimes(1);
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      expect(listener0).toHaveBeenCalledBefore(listener1);
      expect(listener1).toHaveBeenCalledBefore(listener2);

      const args0 = listener0.calls.first().args;
      expect(args0.length).toBe(1);
      const message = args0[0];
      expect(message instanceof ProxyInitMessage).toBe(true);

      expect(listener1).toHaveBeenCalledOnceWith(message);
      expect(listener2).toHaveBeenCalledOnceWith(message);

      expect(message.proxy).toBe(proxy);
      expect(message.realTarget).toBe(realTarget);
      expect(message.graph).toBe(graph);
      expect(message.stopped).toBe(true);
      expect(message.exceptionFound).toBe(false);
      expect(message.exception).toBe(undefined);
    });

    it("does not fail for a broken logger when a listener throws an exception directly", () => {
      const graph = {
        membrane: {
          logger: {
            error: jasmine.createSpy().and.throwError(new Error("whoops"))
          }
        }
      };
      broadcaster = new ProxyBroadcaster(graph);

      addListeners();

      listener1.and.throwError(exception);

      broadcaster.broadcast(proxy, realTarget, true);

      expect(listener0).toHaveBeenCalledTimes(1);
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      expect(listener0).toHaveBeenCalledBefore(listener1);
      expect(listener1).toHaveBeenCalledBefore(listener2);

      const args0 = listener0.calls.first().args;
      expect(args0.length).toBe(1);
      const message = args0[0];
      expect(message instanceof ProxyInitMessage).toBe(true);

      expect(listener1).toHaveBeenCalledOnceWith(message);
      expect(listener2).toHaveBeenCalledOnceWith(message);

      expect(message.proxy).toBe(proxy);
      expect(message.realTarget).toBe(realTarget);
      expect(message.graph).toBe(graph);
      expect(message.stopped).toBe(true);
      expect(message.exceptionFound).toBe(false);
      expect(message.exception).toBe(undefined);

      expect(graph.membrane.logger.error).toHaveBeenCalledOnceWith(exception);
    });
  });
});
