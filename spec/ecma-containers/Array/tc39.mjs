import Membrane from "../../../source/core/Membrane.mjs";

describe("TC39 demonstrations of Array objects in membranes: ", function() {
  let parts;
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
    "Array.prototype.splice behaves correctly with storeUnknownAsLocal",
    function() {
      let appender;

      parts.handlers.dry.addProxyListener(function(meta) {
        if (meta.target !== parts.wet.array)
          return;
        try {
          parts.membrane.modifyRules.storeUnknownAsLocal("dry", meta.proxy);
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
       * object graph.
       */

      Array.prototype.splice.apply(parts.dry.array, [
        1, 1, parts.dry.delta, parts.dry.epsilon
      ]);

      expect(parts.dry.array.length).toBe(4);
      expect(parts.dry.array[0]).toBe(parts.dry.alpha);
      expect(parts.dry.array[1]).toBe(parts.dry.delta);
      expect(parts.dry.array[2]).toBe(parts.dry.epsilon);
      expect(parts.dry.array[3]).toBe(parts.dry.gamma);

      expect(parts.wet.array).toEqual([
        parts.wet.alpha,
        parts.wet.delta,
        parts.wet.epsilon,
        parts.wet.gamma
      ])
    }
  );
});
