import Membrane from "../../source/core/Membrane.mjs";

describe("Promises through a membrane", function() {
  let parts;
  beforeEach(function() {
    parts = {
      wet: {
        wrapper: {},
        response: { value: true }
      },

      dry: {/*
        wrapper: Proxy({}),
        response: Proxy({ value: true })

      */},
      handlers: {},
      membrane: new Membrane(),
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

    parts.dry.response = parts.membrane.convertArgumentToProxy(
      parts.handlers.wet,
      parts.handlers.dry,
      parts.wet.response
    );
  });

  it("Is a Promise", function() {
    let dryP = parts.dry.wrapper.promise;
    expect(dryP).not.toBe(parts.wet.wrapper.promise);

    const DryPromise = parts.membrane.convertArgumentToProxy(
      parts.handlers.wet,
      parts.handlers.dry,
      Promise
    );

    expect(dryP instanceof DryPromise).toBe(true);
  });

  it("Results in a Promise after calling .then()", function() {
    let dryP = parts.dry.wrapper.promise;
    dryP = dryP.then(() => true);

    const DryPromise = parts.membrane.convertArgumentToProxy(
      parts.handlers.wet,
      parts.handlers.dry,
      Promise
    );

    expect(dryP instanceof DryPromise).toBe(true);
  });

  it("may be resolved on the wet side (where the promise came from)", async function() {
    parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(
      result => {
        const value = result.value;
        expect(value).toBe(true);
        return result;
      },
      () => { throw new Error("unreached") }
    );

    parts.wet.wrapper.resolve(parts.wet.response);

    const result = await parts.dry.wrapper.promise;
    expect(result).toBe(parts.dry.response);
  });

  it("may be rejected on the wet side", async function() {
    parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(
      () => { throw new Error("unreached") },
      function(result) {
        expect(result.value).toBe(true);
        throw result;
      }
    );
    parts.wet.wrapper.reject(parts.wet.response);

    let pass = false;
    try {
      await parts.dry.wrapper.promise;
    }
    catch (ex) {
      pass = ex === parts.dry.response;
    }
    expect(pass).toBe(true);
  });

  it("may be resolved on the dry side", async function() {
    expect(parts.dry.wrapper.promise).not.toBe(parts.wet.wrapper.promise);
    parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(
      function(result) {
        expect(result.value).toBe(true);
        return result;
      },
      () => { throw new Error("unreached") }
    );
    parts.dry.wrapper.resolve(parts.dry.response);

    const result = await parts.dry.wrapper.promise;
    expect(result).toBe(parts.dry.response);
  });

  it("may be rejected on the dry side", async function() {
    parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(
      () => { throw new Error("unreached") },
      function(result) {
        expect(result.value).toBe(true);
        throw result;
      }
    );
    parts.dry.wrapper.reject(parts.dry.response);

    let pass = false;
    try {
      await parts.dry.wrapper.promise;
    }
    catch (ex) {
      pass = ex === parts.dry.response;
    }
    expect(pass).toBe(true);
  });
});
