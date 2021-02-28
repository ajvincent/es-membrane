import Membrane from "../../source/core/Membrane.mjs";

describe("Generators through a membrane", function() {
  let parts;
  beforeEach(function() {
    parts = {
      wet: {
        buildGenerator: function* () {
          let count = 0;
          while (true)
          {
            yield { count };
            count++;
          }
        }
      },
      dry: {},
      handlers: {},
      membrane: new Membrane(),

      response: { value: true }
    };

    parts.handlers.wet = parts.membrane.getHandlerByName(
      "wet", { mustCreate: true }
    );
    parts.handlers.dry = parts.membrane.getHandlerByName(
      "dry", { mustCreate: true }
    );

    parts.dry.buildGenerator = parts.membrane.convertArgumentToProxy(
      parts.handlers.wet,
      parts.handlers.dry,
      parts.wet.buildGenerator
    );
  });

  it("work with normal stepping and a return call", function() {
    let generator = parts.dry.buildGenerator();
    expect(generator.next()).toEqual({value: { count: 0}, done: false});
    expect(generator.next()).toEqual({value: { count: 1}, done: false});
    expect(generator.return("x")).toEqual({value: "x", done: true});
    expect(generator.next()).toEqual({value: undefined, done: true});
  });


  it("work with normal stepping and a throw call", function() {
    let generator = parts.dry.buildGenerator();
    expect(generator.next()).toEqual({value: { count: 0}, done: false});
    expect(generator.next()).toEqual({value: { count: 1}, done: false});
    let result;
    expect(function() {
      result = generator.throw("foo");
    }).toThrow("foo");
    expect(result).toBe(undefined);
    expect(generator.next()).toEqual({value: undefined, done: true});
  });
});
