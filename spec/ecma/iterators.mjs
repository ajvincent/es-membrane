import Membrane from "../../source/core/Membrane.mjs";

it("Iterators through a membrane work as expected", function() {
  let parts = {
    wet: {
      iterator: {
        count: 0
      }
    },
    dry: {},
    handlers: {},
    membrane: new Membrane(),

    response: { value: true }
  };

  parts.wet.iterator[Symbol.iterator] = function() {
    return {
      next: function() {
        let rv = {
          value: { count: this.count },
          done: this.count > 3
        };
        this.count++;
        return rv;
      },
      get count() {
        return parts.wet.iterator.count;
      },
      set count(val) {
        parts.wet.iterator.count = val;
      }
    };
  };

  parts.handlers.wet = parts.membrane.getGraphByName(
    "wet", { mustCreate: true }
  );
  parts.handlers.dry = parts.membrane.getGraphByName(
    "dry", { mustCreate: true }
  );

  parts.dry.iterator = parts.membrane.convertArgumentToProxy(
    parts.handlers.wet,
    parts.handlers.dry,
    parts.wet.iterator
  );

  let items = Array.from(parts.dry.iterator)
                   .map((val) => val.count);
  expect(items).toEqual([0, 1, 2, 3]);
});
