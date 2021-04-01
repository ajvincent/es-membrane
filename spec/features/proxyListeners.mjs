/* XXX ajvincent I'm not going to use the MembraneMocks in these tests, because
 * the mocks create proxies to objects before any listeners can be registered.
 * I could modify the mocks to take listeners through an options object, but
 * that is just going to make the mocks code more complicated than necessary.
 *
 * Similarly, the logger we create will not be attached to the membrane.
 */
import loggerLib from "../helpers/logger.mjs"
import Membrane from "../../source/core/Membrane.mjs"
import {
  NWNCDataDescriptor
} from "../../source/core/utilities/shared.mjs";

var membrane, wetHandler, dryHandler, appender, ctor1;
const logger = loggerLib.getLogger("test.membrane.proxylisteners");

function getMessageProp(event) { return event.message; }
function getMessages() {
  return this.events.map(getMessageProp);
}

const acceptSet = new Set();

ctor1 = function(arg1) {
  try {
    this.label = "ctor1 instance";
    this.arg1 = arg1;
  }
  catch (ex) {
    // do nothing, this is not that important to our tests
  }
};
ctor1.prototype.label = "ctor1 prototype";
ctor1.prototype.number = 2;

const listener0 = jasmine.createSpy("listener0");
const listener1 = jasmine.createSpy("listener1");
const listener2 = jasmine.createSpy("listener2");
const listener3 = jasmine.createSpy("listener3");

function reset() {
  listener0.calls.reset();
  listener1.calls.reset();
  listener2.calls.reset();
  listener3.calls.reset();
}

describe("An object graph handler's proxy listeners", function() {
  beforeEach(function() {
    membrane = new Membrane({logger: logger});
    wetHandler = membrane.getGraphByName("wet", { mustCreate: true });
    dryHandler = membrane.getGraphByName("dry", { mustCreate: true });

    listener0.and.stub();
    listener1.and.stub();
    listener2.and.stub();
    listener3.and.stub();

    appender = new loggerLib.Appender();
    logger.addAppender(appender);
    appender.getMessages = getMessages;
    appender.setThreshold("INFO");
  });

  afterEach(function() {
    acceptSet.clear();

    logger.removeAppender(appender);

    wetHandler.revokeEverything();
    dryHandler.revokeEverything();

    membrane = null;
    wetHandler = null;
    dryHandler = null;
    appender = null;

    reset();
  });

  /* XXX ajvincent I could use Jasmine spies, but for once, I don't like the
   * API that Jasmine spies presents.  Instead, I'll use the logger mocks to
   * record events and their order.
   */

  describe("are notified of a proxy when we invoke some trap of the proxy:", function() {
    /* We're not testing API of meta yet.  That'll be a separate test.
    The only reason we test for the proxy is to ensure the proxy is the same for
    the listeners and the returned value.
    */

    let x, dryX;

    beforeEach(function() {
      wetHandler.addProxyInitListener(listener0);
      wetHandler.addProxyInitListener(listener1);
      dryHandler.addProxyInitListener(listener2);
      dryHandler.addProxyInitListener(listener3);

      x = new ctor1("one");
      acceptSet.add(x);

      dryX = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
    });

    function expectListenerOrder() {
      expect(listener0.calls.count()).toBeGreaterThan(0);
      expect(listener0.calls.first().args.length).toBe(1);
      const meta0 = listener0.calls.first().args[0];

      expect(listener1.calls.count()).toBe(listener0.calls.count());
      expect(listener1.calls.first().args.length).toBe(1);
      const meta1 = listener1.calls.first().args[0];
      expect(meta1 === meta0).toBe(true);

      expect(listener2.calls.count()).toBeGreaterThan(0);
      expect(listener2.calls.first().args.length).toBe(1);
      const meta2 = listener2.calls.first().args[0];

      expect(listener3.calls.count()).toBe(listener2.calls.count());
      expect(listener3.calls.first().args.length).toBe(1);
      const meta3 = listener3.calls.first().args[0];
      expect(meta3 === meta2).toBe(true);

      expect(meta0 !== meta2).toBe(true);
      expect(meta0.proxy === dryX).toBe(true);
      expect(meta2.proxy === dryX).toBe(true);
    }

    function expectListenersNotCalled() {
      expect(listener0).toHaveBeenCalledTimes(0);
      expect(listener1).toHaveBeenCalledTimes(0);
      expect(listener2).toHaveBeenCalledTimes(0);
      expect(listener3).toHaveBeenCalledTimes(0);
    }

    it("not via membrane.convertArgumentToProxy", () => {
      x = new ctor1("one");
      acceptSet.add(x);

      dryX = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      expect(dryX !== x).toBe(true);

      expectListenersNotCalled();
    });

    function defineTrapTest(trapName, ...extraArgs) {
      it(trapName, () => {
        void(Reflect[trapName](dryX, ...extraArgs));
        expectListenerOrder();

        reset();

        void(Reflect[trapName](dryX, ...extraArgs));
        expectListenersNotCalled();
      });
    }

    defineTrapTest("ownKeys");
    defineTrapTest("getOwnPropertyDescriptor", "bar");
    defineTrapTest("has", "bar");
    defineTrapTest("get", "bar", {});
    defineTrapTest("getPrototypeOf");
    defineTrapTest("isExtensible");
    defineTrapTest("preventExtensions");
    defineTrapTest("deleteProperty", "bar");
    defineTrapTest("defineProperty", "bar", new NWNCDataDescriptor(3, true));
    defineTrapTest("set", "bar", 3, {});
    defineTrapTest("setPrototypeOf", {});

    it("apply", () => {
      x = function() {};
      acceptSet.add(x);

      const arg = {};
      acceptSet.add(arg);

      dryX = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      reset();

      void(dryX(arg));
      expectListenerOrder();

      reset();

      void(dryX(arg));
      expectListenersNotCalled();
    });

    it("construct", () => {
      x = function() {};
      acceptSet.add(x);

      const arg = {};
      acceptSet.add(arg);

      dryX = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      reset();

      void(new dryX(arg));

      expectListenerOrder();

      reset();

      void(new dryX(arg));
      expectListenersNotCalled();
    });
  });

  describe("can stop iteration to further listeners", function() {
    let meta1, meta2;
    beforeEach(() => {
      meta1 = null;
      meta2 = null;
    });

    it("by invoking meta.stopIteration();", function() {
      dryHandler.addProxyInitListener(listener1);
      dryHandler.addProxyInitListener(listener2);

      listener1.and.callFake(meta => {
        if (!acceptSet.has(meta.realTarget))
          return;

        meta1 = meta;
        meta.stopIteration();
      });

      listener2.and.callFake(meta => {
        if (!acceptSet.has(meta.realTarget))
          return;

        meta2 = meta;
        meta.stopIteration();
      });

      const x = new ctor1("one");
      acceptSet.add(x);

      const X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );

      reset();

      void(Reflect.ownKeys(X));

      expect(listener1).toHaveBeenCalledOnceWith(meta1);
      expect(listener2).toHaveBeenCalledTimes(0);

      expect(meta1).not.toBe(null);
      expect(typeof meta1).toBe("object");
      expect(meta1.proxy).toBe(X);
      expect(meta1.stopped).toBe(true);

      expect(meta2).toBe(null);
    });

    it("by invoking meta.throwException(exn);", function() {
      const dummyExn = {};

      listener1.and.callFake(meta => {
        if (!acceptSet.has(meta.realTarget))
          return;

        meta1 = meta;
        meta.throwException(dummyExn);
      });

      listener2.and.callFake(meta => {
        if (!acceptSet.has(meta.realTarget))
          return;

        meta2 = meta;
        meta.stopIteration();
      });

      dryHandler.addProxyInitListener(listener1);
      dryHandler.addProxyInitListener(listener2);

      const x = new ctor1("one");
      acceptSet.add(x);

      const X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );

      membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      reset();

      expect(function() {
        Reflect.ownKeys(X);
      }).toThrow(dummyExn);

      expect(listener1).toHaveBeenCalledOnceWith(meta1);
      expect(listener2).toHaveBeenCalledTimes(0);

      expect(meta1).not.toBe(null);
      expect(typeof meta1).toBe("object");
      expect(meta1.proxy).toBe(X);
      expect(meta1.stopped).toBe(true);

      expect(meta2).toBe(null);
    });

    it("but not by accidentally triggering an exception", function() {
      const dummyExn = {};

      listener1.and.callFake(meta => {
        if (!acceptSet.has(meta.realTarget))
          return;
        meta1 = meta;
        throw dummyExn; // this is supposed to be an accident
      });

      listener2.and.callFake(meta => {
        if (!acceptSet.has(meta.realTarget))
          return;

        meta2 = meta;
      });

      dryHandler.addProxyInitListener(listener1);
      dryHandler.addProxyInitListener(listener2);

      const x = new ctor1("one");
      acceptSet.add(x);

      const X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );

      reset();

      void(Reflect.ownKeys(X));

      expect(listener1).toHaveBeenCalledOnceWith(meta1);
      expect(listener2).toHaveBeenCalledOnceWith(meta2);

      expect(meta2).toBe(meta1);
      expect(typeof meta2).toBe("object");
      expect(meta2.proxy).toBe(X);
    });
  });
});
