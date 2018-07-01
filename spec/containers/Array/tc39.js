if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

if (typeof loggerLib != "object") {
  if (typeof require == "function") {
    var { loggerLib } = require("../../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

describe("TC39 demonstrations of Array objects in membranes: ", function() {
  "use strict";
  let parts, logger;
  function buildElement(name) {
    let rv = {name};
    Object.freeze(rv);
    return rv;
  }

  beforeEach(function() {
    parts = {
      wet: {
        alpha: buildElement("alpha"),
        beta: buildElement("beta"),
        gamma: buildElement("gamma"),
        delta: buildElement("delta"),
        epsilon: buildElement("epsilon"),
        omega: buildElement("omega"),
        array: [],
      },
      dry: {},
      handlers: {},
      membrane: new Membrane(),
    };

    parts.wet.array.push(parts.wet.alpha);
    parts.wet.array.push(parts.wet.beta);
    parts.wet.array.push(parts.wet.gamma);

    parts.handlers.wet = parts.membrane.getHandlerByName(
      "wet", { mustCreate: true }
    );
    parts.handlers.dry = parts.membrane.getHandlerByName(
      "dry", { mustCreate: true }
    );
  });

  function populateDry() {
    Reflect.ownKeys(parts.wet).forEach(function(key) {
      parts.dry[key] = parts.membrane.convertArgumentToProxy(
        parts.handlers.wet,
        parts.handlers.dry,
        parts.wet[key]
      );
    });

    expect(parts.dry.array).toEqual([
      parts.dry.alpha,
      parts.dry.beta,
      parts.dry.gamma
    ]);
  }

  afterEach(function() {
    parts.handlers.dry.revokeEverything();
    parts.handlers.wet.revokeEverything();
    parts = null;
    logger = null;
  });
  
  it("Without distortions, mirroring functions normally", function() {
    populateDry();

    parts.dry.array.splice(1, 1, parts.dry.delta, parts.dry.epsilon);
    expect(parts.wet.array).toEqual([
      parts.wet.alpha,
      parts.wet.delta,
      parts.wet.epsilon,
      parts.wet.gamma
    ]);

    expect(parts.dry.array).toEqual([
      parts.dry.alpha,
      parts.dry.delta,
      parts.dry.epsilon,
      parts.dry.gamma
    ]);

    parts.wet.array.splice(0, 2, parts.wet.omega);
    expect(parts.wet.array).toEqual([
      parts.wet.omega,
      parts.wet.epsilon,
      parts.wet.gamma
    ]);

    expect(parts.dry.array).toEqual([
      parts.dry.omega,
      parts.dry.epsilon,
      parts.dry.gamma
    ]);
  });

  it(
    "A natural call to .splice operates on the native graph, but doesn't respect storeUnknownAsLocal",
    function() {
      parts.handlers.dry.addProxyListener(function(meta) {
        if (meta.target === parts.wet.array)
        {
          try {
            parts.membrane.modifyRules.storeUnknownAsLocal("dry", meta.proxy);
          }
          catch (e) {
            meta.throwException(e);
          }
        }
      });

      populateDry();

      parts.dry.array.splice(1, 1, parts.dry.delta, parts.dry.epsilon);
      expect(parts.wet.array).toEqual([
        parts.wet.alpha,
        parts.wet.delta,
        parts.wet.epsilon,
        parts.wet.gamma
      ]);

      expect(parts.dry.array).toEqual([
        parts.dry.alpha,
        parts.dry.delta,
        parts.dry.epsilon,
        parts.dry.gamma
      ]);
    }
  );

  xit(
    "Array.prototype.splice on the untrusted graph doesn't work as expected either",
    function() {
      /*
      logger = loggerLib.getLogger("test.membrane.tc39.arrays");
      const appender = new loggerLib.Appender();
      logger.addAppender(appender);

      const chain = parts.membrane.modifyRules.createChainHandler(
        parts.handlers.dry
      );
      parts.membrane.allTraps.forEach(function(trap) {
        chain[trap] = function() {
          logger.info(trap + " enter");
          const rv = this.nextHandler[trap].apply(this, arguments);
          logger.info(trap + " leave");
          return rv;
        };
      });
      ["get", "getOwnPropertyDescriptor", "set", "defineProperty"].forEach(function(trap) {
        chain[trap] = function(target, propertyName) {
          try {
            logger.info(trap + " enter " + propertyName);
          }
          catch (e) {
            logger.info(trap + " enter");
          }
          const rv = this.nextHandler[trap].apply(this, arguments);
          try {
            logger.info(trap + " leave " + propertyName);
          }
          catch (e) {
            logger.info(trap + " leave");
          }
          return rv;
        };
      });

      let pass = false;

      parts.handlers.dry.addProxyListener(function(meta) {
        if (meta.target !== parts.wet.array)
          return;
        try {
          parts.membrane.modifyRules.storeUnknownAsLocal("dry", meta.proxy);
          parts.membrane.modifyRules.replaceProxy(meta.proxy, chain);
          pass = true;
        }
        catch (e) {
          meta.throwException(e);
        }
      });
      */

      populateDry();
      /*
      expect(pass).toBe(true);
      appender.clear();
      */

      Array.prototype.splice.apply(parts.dry.array, [
        1, 1, parts.dry.delta, parts.dry.epsilon
      ]);

      /* XXX ajvincent Actually, I don't know what to expect.
      expect(parts.wet.array).toEqual([
        parts.wet.alpha,
        parts.wet.delta,
        parts.wet.epsilon,
        parts.wet.gamma
      ]);

      expect(parts.dry.array).toEqual([
        parts.dry.alpha,
        parts.dry.delta,
        parts.dry.epsilon,
        parts.dry.gamma
      ]);
      */
    }
  );
});
