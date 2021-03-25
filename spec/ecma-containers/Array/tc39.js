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

    parts.handlers.wet = parts.membrane.getGraphByName(
      "wet", { mustCreate: true }
    );
    parts.handlers.dry = parts.membrane.getGraphByName(
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

      /* At this point, parts.dry.array has never seen delta or epsilon.  The
       * proxy has explicitly been told that new properties should stay local to
       * the proxy and not propagate through... but the splice method belongs
       * to the wet object graph, so execution takes place there and the
       * membrane ignores the storeUnknownAsLocal setting for the array.
       */

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

  it(
    "Array.prototype.splice behaves oddly with storeUnknownAsLocal",
    function() {
      let appender, chain;

      // this is all boilerplate for internal debugging
      if (false) {
        logger = loggerLib.getLogger("test.membrane.tc39.arrays");
        appender = new loggerLib.Appender();
        logger.addAppender(appender);

        chain = parts.membrane.modifyRules.createChainHandler(
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

        ["get", "getOwnPropertyDescriptor"].forEach(function(trap) {
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

        ["set", "defineProperty"].forEach(function(trap) {
          chain[trap] = function(target, propertyName) {
            const hasDesc = Boolean(
              this.nextHandler.getOwnPropertyDescriptor(target, propertyName)
            );
            try {
              logger.info(`${trap} enter ${propertyName} (has: ${hasDesc})`);
            }
            catch (e) {
              logger.info(`${trap} enter (has: ${hasDesc})`);
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
      }

      parts.handlers.dry.addProxyListener(function(meta) {
        if (meta.target !== parts.wet.array)
          return;
        try {
          parts.membrane.modifyRules.storeUnknownAsLocal("dry", meta.proxy);
          if (chain)
            parts.membrane.modifyRules.replaceProxy(meta.proxy, chain);
        }
        catch (e) {
          meta.throwException(e);
        }
      });
      populateDry();

      // debugging
      if (appender)
        appender.clear();

      /* [ alpha, beta, gamma ] */

      /* At this point, parts.dry.array has never seen delta or epsilon.  The
       * proxy has explicitly been told that new properties should stay local to
       * the proxy and not propagate through...
       *
       * This time, we use splice.apply to simulate running splice in the dry
       * object graph, which is about to cause its own problems.
       */

      Array.prototype.splice.apply(parts.dry.array, [
        1, 1, parts.dry.delta, parts.dry.epsilon
      ]);

      expect(parts.dry.array.length).toBe(4);
      expect(parts.dry.array[0]).toBe(parts.dry.alpha);
      expect(parts.dry.array[1]).toBe(parts.dry.delta);
      expect(parts.dry.array[2]).toBe(parts.dry.epsilon);
      expect(parts.dry.array[3]).toBe(parts.dry.gamma);

      expect(parts.wet.array.length).toBe(4);
      expect(parts.wet.array[0]).toBe(parts.wet.alpha);

      expect(parts.wet.array.includes(parts.wet.gamma)).toBe(false);

      /* XXX ajvincent This is actually pretty bad.  The same operation on the
       * wet graph would have resulted in [ alpha, delta, epsilon, gamma ].
       *
       * At the same time, I don't believe this is, strictly speaking, a bug in
       * the membrane implementation.  Normally, when I have a test that shows
       * buggy behavior, I tend to think either the implementation is broken,
       * the test is broken, both, or that there's a flaw in the design.
       *
       * This shows something different:  I'm using an API in a way that it was
       * never designed to be used.  I'm performing a distortion on an array
       * (storeUnknownAsLocal), and then doing a simple splice on it.
       *
       * With a distortion on an array, typically there would be three desirable
       * outcomes to choose from:
       *
       * (1) Holes in the array, when we're hiding something
       * (2) Explicitly undefined spaces in the array, when we're hiding something
       * (3) A continuous list of elements, maintaining order and consistency.
       *
       * Here, we've violated that.  The gamma element was in the array before
       * the splice.  The splice shouldn't have removed it, but it did.
       *
       * This comes down to the algorithm of the splice method as it's
       * defined in the ECMAScript specification.  In particular, it does the
       * rearranging and insertion of elements in-place.  The "this" argument of
       * the splice method is a Proxy that moves the setting of unknown
       * properties to the proxy only - leaving them out of the unwrapped array.
       *
       * Specifically, `this[3] = parts.dry.gamma` is a step that happens inside
       * the splice algorithm here, but that means parts.wet.gamma[3] is not
       * correspondingly set.  Then later, when this[1] and this[2] are also set
       * using the Proxy API, the reference to parts.wet.gamma is permanently
       * lost from the wet array.
       *
       * So yes, we've created a hole in the wet array (which is acceptable, if
       * ugly), but we've also created data-loss (which is not acceptable).
       *
       * Individually though, each of the pieces is working as it was originally
       * intended:  splice is very specifically designed, as is the Proxy API,
       * and storeUnknownAsLocal is simply forcing the proxy to keep "new" values
       * private.  It's the combination that's flawed, and the combination that
       * needs special handling.
       */
    }
  );
});
