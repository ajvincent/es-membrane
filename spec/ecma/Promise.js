/*
import "../docs/dist/es6-modules/Membrane.js";
*/

if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

describe("Promises through a membrane", function() {
  let parts;
  beforeEach(function() {
    parts = {
      wet: {
        wrapper: {}
      },
      dry: {},
      handlers: {},
      membrane: new Membrane(),

      response: { value: true }
    };
    parts.wet.wrapper.promise = new Promise(function(resolve, reject) {
      parts.wet.wrapper.resolve = resolve;
      parts.wet.wrapper.reject  = reject;
    });

    parts.handlers.wet = parts.membrane.getHandlerByName(
      "wet", { mustCreate: true }
    );
    parts.handlers.dry = parts.membrane.getHandlerByName(
      "dry", { mustCreate: true }
    );

    parts.dry.wrapper = parts.membrane.convertArgumentToProxy(
      parts.handlers.wet,
      parts.handlers.dry,
      parts.wet.wrapper
    );
  });

  it(
    "may be resolved on the wet side (where the promise came from)",
    function(done) {
      expect(parts.dry.wrapper.promise).not.toBe(parts.wet.wrapper.promise);
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(
        function(result) {
          expect(result.value).toBe(true);
        },
        fail
      );
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(done, done);
      parts.wet.wrapper.resolve(parts.response);
    }
  );

  it(
    "may be rejected on the wet side",
    function(done) {
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(
        fail,
        function(result) {
          expect(result.value).toBe(true);
        }
      );
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(done, done);
      parts.wet.wrapper.reject(parts.response);
    }
  );

  it(
    "may be resolved on the dry side",
    function(done) {
      expect(parts.dry.wrapper.promise).not.toBe(parts.wet.wrapper.promise);
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(
        function(result) {
          expect(result.value).toBe(true);
        },
        fail
      );
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(done, done);
      parts.dry.wrapper.resolve(parts.response);
    }
  );

  it(
    "may be rejected on the dry side",
    function(done) {
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(
        fail,
        function(result) {
          expect(result.value).toBe(true);
        }
      );
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(done, done);
      parts.dry.wrapper.reject(parts.response);
    }
  );

  it(
    "wrap the resolved value after an await",
    async function(done) {
      var obj = {"foo": 47};
      parts.wet.wrapper.resolve(obj);
      var p = parts.dry.wrapper.promise;
      var result = await p;
      expect(result).not.toBe(obj);
      expect(result.foo).toBe(47);
      done();
    }
  );
});
