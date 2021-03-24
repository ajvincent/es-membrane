import MembraneMocks from "../helpers/mocks.mjs";

describe("Truncation of argument lists", function() {
  var wetDocument, dryDocument, membrane, parts;
  const arg0 = "arg0", arg1 = "arg1", arg2 = "arg2";

  var argCount, target, check, truncator;

  // a and b are here solely to check for function arity.
  function checkArgCount(a, b) {
    void(a);
    void(b);
    argCount = arguments.length;
    if (arguments.length > 0)
      expect(arguments[0]).toBe(arg0);
    if (arguments.length > 1)
      expect(arguments[1]).toBe(arg1);
    if (arguments.length > 2)
      expect(arguments[2]).toBe(arg2);
  }

  beforeEach(function() {
    parts = MembraneMocks();
    wetDocument = parts.wet.doc;
    dryDocument = parts.dry.doc;
    membrane = parts.membrane;

    wetDocument.checkArgCount = checkArgCount;
    target = dryDocument.checkArgCount;

    argCount = NaN;
  });

  afterEach(function() {
    wetDocument = null;
    dryDocument = null;
    check = null;
  });

  function defineTests() {
    it(
      "is disabled by default:  any number of arguments is allowed",
      function() {
        target(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "goes to the function's arity when truncateArgList is invoked with true",
      function() {
        truncator(true);
        check(arg0, arg1, arg2);
        expect(argCount).toBe(2);
      }
    );

    it(
      "allows any number of arguments when truncateArgList is invoked with false",
      function() {
        truncator(false);
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "goes to the specified length when truncateArgList is invoked with a positive number",
      function() {
        truncator(1);
        check(arg0, arg1, arg2);
        expect(argCount).toBe(1);
      }
    );

    it(
      "goes to the specified length when truncateArgList is invoked with 0",
      function() {
        truncator(0);
        check(arg0, arg1, arg2);
        expect(argCount).toBe(0);
      }
    );

    it(
      "does not add arguments when truncateArgList is invoked with a number greater than the functipn's arity",
      function() {
        truncator(100);
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "is rejected when truncateArgList is invoked with a non-integer number",
      function() {
        expect(function() {
          truncator(2.5);
        }).toThrow();
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "is rejected when truncateArgList is invoked with a negative number",
      function() {
        expect(function() {
          truncator(-1);
        }).toThrow();
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "is rejected when truncateArgList is invoked with an infinite number",
      function() {
        expect(function() {
          truncator(Infinity);
        }).toThrow();
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "is rejected when truncateArgList is invoked with NaN",
      function() {
        expect(function() {
          truncator(NaN);
        }).toThrow();
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "is rejected when truncateArgList is invoked with a string",
      function() {
        expect(function() {
          truncator("foo");
        }).toThrow();
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "is rejected when truncateArgList is invoked with an object",
      function() {
        expect(function() {
          truncator({});
        }).toThrow();
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );
  }

  function defineGraphTests(graphName) {
    beforeEach(function() {
      truncator = function(limit) {
        membrane.modifyRules.truncateArgList(
          graphName, parts[graphName].doc.checkArgCount, limit
        );
      };
    });

    describe("and the apply trap", function() {
      beforeEach(function() {
        check = dryDocument.checkArgCount;
      });
      defineTests(graphName);
    });

    describe("and the construct trap", function() {
      beforeEach(function() {
        check = function(a0, a1, a2) {
          return new target(a0, a1, a2);
        };
      });
      defineTests(graphName);
    });
  }

  describe("on the wet graph", function() {
    defineGraphTests("wet");
  });

  describe("on the dry graph", function() {
    defineGraphTests("dry");
  });

  describe("on both the wet and dry graphs, the lower non-negative integer applies", function() {
    beforeEach(function() {
      truncator = function(wetLimit, dryLimit) {
        membrane.modifyRules.truncateArgList(
          "wet", parts.wet.doc.checkArgCount, wetLimit
        );

        membrane.modifyRules.truncateArgList(
          "dry", parts.dry.doc.checkArgCount, dryLimit
        );

        check = dryDocument.checkArgCount;
      };
    });

    it("from the wet graph", function() {
      truncator(1, 3);
      check(arg0, arg1, arg2);
      expect(argCount).toBe(1);
    });

    it("from the dry graph", function() {
      truncator(3, 1);
      check(arg0, arg1, arg2);
      expect(argCount).toBe(1);
    });
  });
});
