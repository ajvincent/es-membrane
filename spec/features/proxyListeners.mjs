/* XXX ajvincent I'm not going to use the MembraneMocks in these tests, because
 * the mocks create proxies to objects before any listeners can be registered.
 * I could modify the mocks to take listeners through an options object, but
 * that is just going to make the mocks code more complicated than necessary.
 *
 * Similarly, the logger we create will not be attached to the membrane.
 */
import loggerLib from "../helpers/logger.mjs"
import Membrane from "../../source/core/Membrane.mjs"

describe("An object graph handler's proxy listeners", function() {
  var membrane, wetHandler, dryHandler, appender, ctor1;
  const logger = loggerLib.getLogger("test.membrane.proxylisteners");

  function getMessageProp(event) { return event.message; }
  function getMessages() {
    return this.events.map(getMessageProp);
  }

  const acceptSet = new Set();
  afterEach(() => acceptSet.clear());

  beforeEach(function() {
    membrane = new Membrane({logger: logger});
    wetHandler = membrane.getHandlerByName("wet", { mustCreate: true });
    dryHandler = membrane.getHandlerByName("dry", { mustCreate: true });

    appender = new loggerLib.Appender();
    logger.addAppender(appender);
    appender.getMessages = getMessages;
    appender.setThreshold("INFO");

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
  });

  afterEach(function() {
    logger.removeAppender(appender);

    wetHandler.revokeEverything();
    dryHandler.revokeEverything();

    membrane = null;
    wetHandler = null;
    dryHandler = null;
    appender = null;
  });

  /* XXX ajvincent I could use Jasmine spies, but for once, I don't like the
   * API that Jasmine spies presents.  Instead, I'll use the logger mocks to
   * record events and their order.
   */

  describe("are notified of a proxy before the proxy is returned", function() {
    /* We're not testing API of meta yet.  That'll be a separate test.
    The only reason we test for the proxy is to ensure the proxy is the same for
    the listeners and the returned value.
    */

    var meta0, meta1, meta2;
    function listener0(meta) {
      if (acceptSet.has(meta.realTarget)) {
        meta0 = meta;
        logger.info("listener0");
      }
    }
    function listener1(meta) {
      if (acceptSet.has(meta.realTarget)) {
        meta1 = meta;
        logger.info("listener1");
      }
    }
    function listener2(meta) {
      if (acceptSet.has(meta.realTarget)) {
        meta2 = meta;
        logger.info("listener2");
      }
    }

    function reset() {
      appender.clear();
      meta0 = undefined;
      meta1 = undefined;
      meta2 = undefined;
    }

    beforeEach(function() {
      wetHandler.addProxyListener(listener0);
      wetHandler.addProxyListener(listener2);
      dryHandler.addProxyListener(listener1);
      dryHandler.addProxyListener(listener2);
      reset();
    });

    afterEach(reset);

    it("via membrane.convertArgumentToProxy", function() {
      var x = new ctor1("one");
      acceptSet.add(x);

      logger.info("x created");
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      logger.info("dry(x) created");
      expect(X.label).toBe("ctor1 instance");
      expect(X).not.toBe(x);

      let messages = appender.getMessages();
      expect(messages.length).toBe(6);
      expect(messages[0]).toBe("x created");

      // origin ObjectGraphHandler's listeners
      expect(messages[1]).toBe("listener0");
      expect(messages[2]).toBe("listener2");

      // target ObjectGraphHandler's listeners
      expect(messages[3]).toBe("listener1");
      expect(messages[4]).toBe("listener2");

      expect(messages[5]).toBe("dry(x) created");

      expect(meta2).toBe(meta1);
      expect(typeof meta2).toBe("object");
      expect(meta0).not.toBe(undefined);
      expect(meta2.proxy).toBe(X);
    });

    it("via wrapping a non-primitive property", function() {
      var y = {};
      var x = new ctor1(y);
      expect(x.arg1).toBe(y);
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      appender.clear();
      acceptSet.add(x.arg1);

      logger.info("X.arg1 retrieval start");
      var Y = X.arg1;
      logger.info("X.arg1 retrieval end");
      expect(Y).not.toBe(y);

      let messages = appender.getMessages();
      expect(messages.length).toBe(6);
      expect(messages[0]).toBe("X.arg1 retrieval start");

      // origin ObjectGraphHandler's listeners
      expect(messages[1]).toBe("listener0");
      expect(messages[2]).toBe("listener2");

      // target ObjectGraphHandler's listeners
      expect(messages[3]).toBe("listener1");
      expect(messages[4]).toBe("listener2");

      expect(messages[5]).toBe("X.arg1 retrieval end");

      expect(meta2).toBe(meta1);
      expect(typeof meta2).toBe("object");
      expect(meta0).not.toBe(undefined);
      expect(meta2.proxy).toBe(Y);
    });

    it("via wrapping a primitive property", function() {
      var y = 4;
      var x = new ctor1(y);
      expect(x.arg1).toBe(y);

      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      reset();

      logger.info("X.arg1 retrieval start");
      var Y = X.arg1;
      logger.info("X.arg1 retrieval end");
      expect(Y).toBe(y); // because it's a primitive

      let messages = appender.getMessages();
      expect(messages.length).toBe(2);
      expect(messages[0]).toBe("X.arg1 retrieval start");
      expect(messages[1]).toBe("X.arg1 retrieval end");

      expect(meta0).toBe(undefined);
      expect(meta1).toBe(undefined);
      expect(meta2).toBe(undefined);
    });

    it("via counter-wrapping a non-primitive argument", function() {
      var cbVal;
      const Z = { argIndex: 0 }, Z2 = { argIndex: 1 }, rv = { isRV: true };
      function callback(k) {
        logger.info("Entering callback");
        cbVal = k;
        logger.info("Exiting callback");
        return rv;
      }

      var x = new ctor1(callback);
      expect(x.arg1).toBe(callback);
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );

      reset();
      acceptSet.add(Z);
      acceptSet.add(Z2);
      acceptSet.add(rv);

      logger.info("Calling X.arg1 start");

      var K = X.arg1(Z, Z2);
      logger.info("Calling X.arg1 end");
      expect(cbVal).not.toBe(undefined);
      expect(cbVal).not.toBe(null);
      expect(typeof cbVal).toBe("object");
      if (cbVal)
        expect(cbVal.argIndex).toBe(0);

      let messages = appender.getMessages();
      expect(messages.length).toBe(16);
      expect(messages[0]).toBe("Calling X.arg1 start");

      // for argument 0
      // origin ObjectGraphHandler's listeners
      expect(messages[1]).toBe("listener1");
      expect(messages[2]).toBe("listener2");
      // target ObjectGraphHandler's listeners
      expect(messages[3]).toBe("listener0");
      expect(messages[4]).toBe("listener2");

      // for argument 1
      // origin ObjectGraphHandler's listeners
      expect(messages[5]).toBe("listener1");
      expect(messages[6]).toBe("listener2");
      // target ObjectGraphHandler's listeners
      expect(messages[7]).toBe("listener0");
      expect(messages[8]).toBe("listener2");

      // executing the method
      expect(messages[9]).toBe("Entering callback");
      expect(messages[10]).toBe("Exiting callback");

      // for return value
      // origin ObjectGraphHandler's listeners
      expect(messages[11]).toBe("listener0");
      expect(messages[12]).toBe("listener2");
      // target ObjectGraphHandler's listeners
      expect(messages[13]).toBe("listener1");
      expect(messages[14]).toBe("listener2");

      expect(messages[15]).toBe("Calling X.arg1 end");

      expect(typeof meta2).toBe("object");
      expect(K).not.toBe(undefined);
      expect(K !== null).toBe(true, "expect(K).not.toBe(null)");
      expect(typeof K).toBe("object");
      if (K)
        expect(K.isRV).toBe(true);
    });

    it("via counter-wrapping a primitive argument", function() {
      var cbVal;
      function callback(k) {
        cbVal = k;
      }

      var x = new ctor1(callback);
      expect(x.arg1).toBe(callback);
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );

      reset();

      const Z = true;
      acceptSet.add(Z);

      logger.info("Calling X.arg1 start");
      X.arg1(Z);
      logger.info("Calling X.arg1 end");
      expect(cbVal).not.toBe(undefined);

      let messages = appender.getMessages();
      expect(messages.length).toBe(2);
      expect(messages[0]).toBe("Calling X.arg1 start");
      expect(messages[1]).toBe("Calling X.arg1 end");

      expect(meta0).toBe(undefined);
      expect(meta1).toBe(undefined);
      expect(meta2).toBe(undefined);
      expect(cbVal).toBe(true);
    });
  });

  describe("can stop iteration to further listeners", function() {
    var meta1, meta2;
    beforeEach(function() {
      meta1 = undefined;
      meta2 = undefined;
    });

    it("by invoking meta.stopIteration();", function() {
      function listener1(meta) {
        if (!acceptSet.has(meta.realTarget))
          return;

        meta1 = meta;
        logger.info("listener1: stopped = " + meta.stopped);
        logger.info("listener1: calling meta.stopIteration();");
        meta.stopIteration();
        logger.info("listener1: stopped = " + meta.stopped);
      }

      function listener2(meta) {
        if (!acceptSet.has(meta.realTarget))
          return;

        // we should never get here
        meta2 = meta;
        logger.info("listener2: stopped = " + meta.stopped);
        logger.info("listener2: calling meta.stopIteration();");
        meta.stopIteration();
        logger.info("listener2: stopped = " + meta.stopped);
      }

      dryHandler.addProxyListener(listener1);
      dryHandler.addProxyListener(listener2);

      var x = new ctor1("one");
      acceptSet.add(x);

      logger.info("x created");
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      logger.info("dry(x) created");
      expect(X.label).toBe("ctor1 instance");
      expect(X).not.toBe(x);

      let messages = appender.getMessages();
      expect(messages.length).toBe(5);
      expect(messages[0]).toBe("x created");
      expect(messages[1]).toBe("listener1: stopped = false");
      expect(messages[2]).toBe("listener1: calling meta.stopIteration();");
      expect(messages[3]).toBe("listener1: stopped = true");
      expect(messages[4]).toBe("dry(x) created");

      expect(meta2).toBe(undefined);
      expect(typeof meta1).toBe("object");
      expect(meta1.proxy).toBe(X);
      expect(meta1.stopped).toBe(true);
    });

    it("by invoking meta.throwException(exn);", function() {
      const dummyExn = {};
      function listener1(meta) {
        if (!acceptSet.has(meta.realTarget))
          return;

        meta1 = meta;
        logger.info("listener1: stopped = " + meta.stopped);
        logger.info("listener1: calling meta.throwException(exn1);");
        meta.throwException(dummyExn);
        logger.info("listener1: stopped = " + meta.stopped);
      }

      function listener2(meta) {
        if (!acceptSet.has(meta.realTarget))
          return;

        // we should never get here
        meta2 = meta;
        logger.info("listener2: stopped = " + meta.stopped);
        logger.info("listener2: calling meta.stopIteration();");
        meta.stopIteration();
        logger.info("listener2: stopped = " + meta.stopped);
      }

      dryHandler.addProxyListener(listener1);
      dryHandler.addProxyListener(listener2);

      var x = new ctor1("one");
      acceptSet.add(x);
      logger.info("x created");
      expect(function() {
        membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          x
        );
      }).toThrow(dummyExn);
      logger.info("dry(x) threw");

      let messages = appender.getMessages();
      expect(messages.length).toBe(5);
      expect(messages[0]).toBe("x created");
      expect(messages[1]).toBe("listener1: stopped = false");
      expect(messages[2]).toBe("listener1: calling meta.throwException(exn1);");
      expect(messages[3]).toBe("listener1: stopped = true");
      expect(messages[4]).toBe("dry(x) threw");

      expect(meta2).toBe(undefined);
      expect(typeof meta1).toBe("object");
      expect(meta1.stopped).toBe(true);
    });

    it("but not by accidentally triggering an exception", function() {
      const dummyExn = {};
      function listener1(meta) {
        if (!acceptSet.has(meta.realTarget))
          return;
        meta1 = meta;
        logger.info("listener1: stopped = " + meta.stopped);
        throw dummyExn; // this is supposed to be an accident
      }

      function listener2(meta) {
        if (!acceptSet.has(meta.realTarget))
          return;
        meta2 = meta;
        logger.info("listener2: stopped = " + meta.stopped);
      }

      dryHandler.addProxyListener(listener1);
      dryHandler.addProxyListener(listener2);

      var x = new ctor1("one");
      acceptSet.add(x);

      logger.info("x created");
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      logger.info("dry(x) created");
      expect(X.label).toBe("ctor1 instance");
      expect(X).not.toBe(x);

      let messages = appender.getMessages();
      expect(messages.length).toBe(5);
      expect(messages[0]).toBe("x created");
      expect(messages[1]).toBe("listener1: stopped = false");
      expect(messages[2]).toBe(dummyExn);
      expect(messages[3]).toBe("listener2: stopped = false");
      expect(messages[4]).toBe("dry(x) created");

      expect(meta2).toBe(meta1);
      expect(typeof meta2).toBe("object");
      expect(meta2.proxy).toBe(X);
    });
  });
});
