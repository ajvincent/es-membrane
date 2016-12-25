/* XXX ajvincent I'm not going to use the MembraneMocks in these tests, because
 * the mocks create proxies to objects before any listeners can be registered.
 * I could modify the mocks to take listeners through an options object, but
 * that is just going to make the mocks code more complicated than necessary.
 *
 * Similarly, the logger we create will not be attached to the membrane.
 */

if (typeof loggerLib != "object") {
  if (typeof require == "function") {
    var { loggerLib } = require("../dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../dist/node/es7-membrane.js");
  }
}

describe("An object graph handler's proxy listeners", function() {
  var membrane, wetHandler, dryHandler, appender;
  const logger = loggerLib.getLogger("membrane.test.defineProperty");

  function ctor1(arg1) {
    this.label = "ctor1 instance";
    this.arg1 = arg1;
  }
  ctor1.prototype.label = "ctor1 prototype";
  ctor1.prototype.number = 2;

  function ctor2(arg1, arg2) {
    ctor1.apply(this, arguments);
    this.arg2 = arg2;
  }
  ctor2.prototype.bool = true;

  function getMessageProp(event) { return event.message; }
  function getMessages() {
    return this.events.map(getMessageProp);
  }

  beforeEach(function() {
    membrane = new Membrane();
    wetHandler = membrane.getHandlerByField("wet", true);
    dryHandler = membrane.getHandlerByField("dry", true);

    appender = new loggerLib.Appender();
    logger.addAppender(appender);
    appender.getMessages = getMessages;
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
    function listener1(meta) {
      meta1 = meta;
      logger.info("listener1");
    }
    function listener2(meta) {
      meta2 = meta;
      logger.info("listener2");
    }
    function listener0(meta) {
      meta0 = meta;
      logger.info("listener0");
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
      expect(messages.length).toBe(4);
      expect(messages[0]).toBe("x created");
      expect(messages[1]).toBe("listener1");
      expect(messages[2]).toBe("listener2");
      expect(messages[3]).toBe("dry(x) created");

      expect(meta2).toBe(meta1);
      expect(typeof meta2).toBe("object");
      expect(meta0).toBe(undefined);
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

      logger.info("X.y retrieval start");
      var Y = X.arg1;
      logger.info("X.y retrieval end");
      expect(Y).not.toBe(y);

      let messages = appender.getMessages();
      expect(messages.length).toBe(4);
      expect(messages[0]).toBe("X.y retrieval start");
      expect(messages[1]).toBe("listener1");
      expect(messages[2]).toBe("listener2");
      expect(messages[3]).toBe("X.y retrieval end");

      expect(meta2).toBe(meta1);
      expect(typeof meta2).toBe("object");
      expect(meta0).toBe(undefined);
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

      logger.info("X.y retrieval start");
      var Y = X.arg1;
      logger.info("X.y retrieval end");
      expect(Y).toBe(y); // because it's a primitive

      let messages = appender.getMessages();
      expect(messages.length).toBe(2);
      expect(messages[0]).toBe("X.y retrieval start");
      expect(messages[1]).toBe("X.y retrieval end");

      expect(meta0).toBe(undefined);
      expect(meta1).toBe(undefined);
      expect(meta2).toBe(undefined);
    });

    it("via counter-wrapping a non-primitive argument", function() {
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

      {
        let Y = X.arg1; // we've already tested this above
        reset();
        Y = null;
      }

      const Z = {};

      logger.info("Calling X.arg1 start");
      X.arg1(Z);
      logger.info("Calling X.arg1 end");
      expect(cbVal).not.toBe(undefined);

      let messages = appender.getMessages();
      expect(messages.length).toBe(4);
      expect(messages[0]).toBe("Calling X.arg1 start");
      expect(messages[1]).toBe("listener0");
      expect(messages[2]).toBe("listener2");
      expect(messages[3]).toBe("Calling X.arg1 end");

      expect(meta2).toBe(meta0);
      expect(typeof meta2).toBe("object");
      expect(meta1).toBe(undefined);
      expect(meta2.proxy).toBe(cbVal);
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

      {
        let Y = X.arg1; // we've already tested this above
        reset();
        Y = null;
      }

      const Z = true;

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

  describe("can override the proxy to return", function() {
    it("with a primitive", function() {
      var rv = "primitive";
      dryHandler.addProxyListener(function(meta) {
        meta.proxy = rv;
      });
      var x = new ctor1("one");
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      expect(X).toBe(rv);
    });

    it("with a non-primitive", function() {
      var rv = {};
      dryHandler.addProxyListener(function(meta) {
        meta.proxy = rv;
      });
      var x = new ctor1("one");
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      expect(X).toBe(rv);
    });

    it("with the unwrapped value, and without Membrane protection", function() {
      var rv = {};
      dryHandler.addProxyListener(function(meta) {
        meta.proxy = meta.target;
      });
      var x = new ctor1(rv);
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      expect(X).toBe(x);

      // If X was wrapped, X.arg1 would also be wrapped, and wouldn't be rv.
      expect(X.arg1).toBe(rv);
    });

    it("with a new proxy built from the existing handler", function() {
      var handler2 = membrane.modifyRules.createChainHandler(dryHandler);
      var extraDesc = {
        value: 3,
        writable: true,
        enumerable: true,
        configurable: true
      };
      
      handler2.getOwnPropertyDescriptor = function(target, propName) {
        if (propName == "extra")
          return extraDesc;
        return this.nextHandler.getOwnPropertyDescriptor(target, propName);
      };
      dryHandler.addProxyListener(function(meta) {
        meta.handler = handler2;
        meta.rebuildProxy();
      });

      var x = new ctor1("three");
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );

      expect(X.extra).toBe(3);
      expect(x.extra).toBe(undefined);
    });

    it("with a new proxy built locally", function() {
      /* XXX ajvincent BE EXTREMELY CAREFUL IF YOU EVER DO THIS.  This is like
       * returning an object to override the membrane's handlers... including
       * the membrane being unable to revoke your proxy or provide any membrane
       * properties.  In short, it's a really bad idea.
       *
       * What you _should_ do is demonstrated in the previous test:  create a
       * chain handler, define methods on it, and then call meta.rebuildProxy().
       */

      var extraDesc = {
        value: 3,
        writable: true,
        enumerable: true,
        configurable: true
      };

      var handler2 = {};
      handler2.getOwnPropertyDescriptor = function(target, propName) {
        if (propName == "extra")
          return extraDesc;
        return Reflect.getOwnPropertyDescriptor(target, propName);
      };

      function listener(meta) {
        meta.proxy = new Proxy(meta.target, handler2);        
      }

      dryHandler.addProxyListener(listener);

      var x = new ctor1("three");
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );

      let XDesc = Reflect.getOwnPropertyDescriptor(X, "extra");
      expect(XDesc.value).toBe(3);
      expect(x.extra).toBe(undefined);
    });
  });
});
