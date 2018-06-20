if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

describe("Internal API:  A PriorityQueue", function() {
  "use strict";
  var queue, results;
  const LT4 = Symbol("lessThanFour");
  const LT7 = Symbol("lessThanSeven");
  const TAIL = Symbol("tail");

  beforeEach(function() {
    queue = Membrane.createPriorityQueue([LT4, LT7, TAIL]);
    results = [];
  });

  function addCallback(value) {
    return function() {
      results.push(value);
    };
  }

  it(
    "accepts only non-empty arrays of strings and symbols at construction",
    function()
    {
      function buildQueue(levels)
      {
        return function()
        {
          return Membrane.createPriorityQueue(levels);
        };
      }
      expect(buildQueue(["first", "second"])).not.toThrow();
      expect(buildQueue([])).toThrow();
      expect(buildQueue(["first", "second", undefined])).toThrow();
      expect(buildQueue(["first", "second", Symbol(undefined)])).not.toThrow();

      // No duplicates.
      expect(buildQueue(["first", "second", "first"])).toThrow();
    }
  );

  it(
    "fires callbacks in the right order",
    function()
    {
      queue.append(TAIL, addCallback(7));
      queue.append(LT7,  addCallback(4));
      queue.append(LT4,  addCallback(1));

      queue.append(TAIL, addCallback(8));
      queue.append(LT7,  addCallback(5));
      queue.append(LT4,  addCallback(2));

      queue.append(TAIL, addCallback(9));
      queue.append(LT7,  addCallback(6));
      queue.append(LT4,  addCallback(3));

      for (let i = 0; i < 9; i++)
        expect(queue.next()).toBe(true);
      expect(queue.next()).toBe(false);

      expect(results.length).toBe(9);
      results.forEach(function(element, index) {
        expect(element).toBe(index + 1);
      });
    }
  );

  it(
    "allows instering callbacks after iteration has begun",
    function()
    {
      queue.append(TAIL, addCallback(7));
      queue.append(LT7,  addCallback(4));
      queue.append(LT4,  addCallback(1));

      queue.next();

      queue.append(TAIL, addCallback(8));
      queue.append(LT7,  addCallback(5));
      queue.append(LT4,  addCallback(2));

      queue.append(TAIL, addCallback(9));
      queue.append(LT7,  addCallback(6));
      queue.append(LT4,  addCallback(3));

      while (queue.next())
      {
        // do nothing
      }

      expect(results.length).toBe(9);
      results.forEach(function(element, index) {
        expect(element).toBe(index + 1);
      });
    }
  );

  it(
    "truncates callbacks on an exception after iteration has begun",
    function()
    {
      queue.append(TAIL, addCallback(7));
      queue.append(LT7,  addCallback(4));
      queue.append(LT4,  addCallback(1));

      queue.append(TAIL, addCallback(8));
      queue.append(LT7, function() {
        throw new Error("foo");
      });
      queue.append(LT4,  addCallback(2));

      queue.append(TAIL, addCallback(9));
      queue.append(LT7,  addCallback(6));
      queue.append(LT4,  addCallback(3));

      for (let i = 0; i < 4; i++)
        expect(queue.next()).toBe(true);
      expect(() => queue.next()).toThrow();

      expect(results.length).toBe(4);
      results.forEach(function(element, index) {
        expect(element).toBe(index + 1);
      });

      expect(queue.next()).toBe(false);
      expect(results.length).toBe(4);
      results.forEach(function(element, index) {
        expect(element).toBe(index + 1);
      });
    }
  );

  it(
    "throws for an unrecognized level name",
    function()
    {
      expect(function() {
        queue.append("tail", function() {});
      }).toThrow();
    }
  );

  it(
    "throws for calling append with a non-function for the second argument",
    function()
    {
      expect(function() {
        queue.append(LT4, true);
      }).toThrow();
    }
  );

  it(
    "does nothing if there are no callbacks registered",
    function() {
      expect(queue.next()).toBe(false);
    }
  );
});
