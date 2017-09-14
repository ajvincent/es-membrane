if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es7-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

/* Sometimes, we just want a proxy trap to be dead and unavailable.  For
 * example, some functions should never be callable as constructors.  Others
 * should only be callable as constructors.  The .disableTraps() API allows us
 * to enforce this rule.
 */

describe(
  "Membrane.modifyRulesAPI.disableTraps() allows the user to prevent",
  function() {
    var membrane, wetHandler, dryHandler, dryVoid;
    function voidFunc() {}

    beforeEach(function() {
      membrane = new Membrane();
      wetHandler = membrane.getHandlerByName("wet", { mustCreate: true });
      dryHandler = membrane.getHandlerByName("dry", { mustCreate: true });
      dryVoid = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        voidFunc
      );
    });
    
    afterEach(function() {
      wetHandler.revokeEverything();
      dryHandler.revokeEverything();
      wetHandler = null;
      dryHandler = null;
      membrane = null;
    });

    it(
      "invoking a function via .apply from the wet object graph",
      function() {
        membrane.modifyRules.disableTraps("wet", voidFunc, ["apply"]);
        var message = null, x;
        try {
          x = dryVoid(0);
        }
        catch (ex) {
          message = ex.message;
        }
        expect(message).toBe("The apply trap is not executable.");
      }
    );

    it(
      "invoking a function via .apply from the dry object graph",
      function() {
        membrane.modifyRules.disableTraps("dry", dryVoid, ["apply"]);
        var message = null, x;
        try {
          x = dryVoid(0);
        }
        catch (ex) {
          message = ex.message;
        }
        expect(message).toBe("The apply trap is not executable.");
      }
    );

    it(
      "invoking a function via .construct from the wet object graph",
      function() {
        membrane.modifyRules.disableTraps("wet", voidFunc, ["construct"]);
        var message = null, x;
        try {
          x = new dryVoid(0);
        }
        catch (ex) {
          message = ex.message;
        }
        expect(message).toBe("The construct trap is not executable.");
      }
    );

    it(
      "invoking a function via .construct from the dry object graph",
      function() {
        membrane.modifyRules.disableTraps("dry", dryVoid, ["construct"]);
        var message = null, x;
        try {
          x = new dryVoid(0);
        }
        catch (ex) {
          message = ex.message;
        }
        expect(message).toBe("The construct trap is not executable.");
      }
    );
  }
);
