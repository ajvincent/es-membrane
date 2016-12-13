"use strict";

/* An API often means to expose only a specific subset of properties.  Anything
 * else must be hidden as private.  By filtering the list of own keys, a
 * developer can hide private properties so that the end-user never sees them.
 *
 * This testcase should be rewritten when we support membrane.addProxyListener.
*/

if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

{
  it("Use case:  Hiding properties of an object", function() {
    /* XXX ajvincent This is a hack, for a property that shouldn't be in the
       real membrane.
    */
    function fixKeys(keys) {
      if (keys.includes("membraneGraphName"))
        keys.splice(keys.indexOf("membraneGraphName"), 1);
    }

    var dryDocument, wetDocument;

    // Internal code, setting up the environment.
    {
      let parts = MembraneMocks();
      let dryWetMB = parts.membrane;
      wetDocument = parts.wet.doc;
      //dryWetMB.buildMapping("wet", wetDocument);

      const whiteListedDocProps = new Set([
        "ownerDocument", "childNodes", "nodeType", "nodeName", "parentNode",
        "createElement", "insertBefore", "firstChild", "baseURL", "rootElement",
        "dispatchEvent", "addEventListener", "membraneGraphName"
      ]);
      let wetDocFilter = function(propName) {
        return whiteListedDocProps.has(propName);
      };

      dryWetMB.modifyRules.filterOwnKeys("wet", wetDocument, wetDocFilter);

      dryDocument = parts.dry.doc;
    }

    // External code, which this environment only partially controls.
    {
      let firstKeySet = Object.keys(dryDocument);
      fixKeys(firstKeySet);

      // Publicly defined property
      expect(firstKeySet.includes("nodeType")).toBe(true);
      expect(dryDocument.nodeType).toBe(9);

      // Hidden property
      expect(firstKeySet.includes("shouldNotBeAmongKeys")).toBe(false);
      expect(Reflect.getOwnPropertyDescriptor(dryDocument, "shouldNotBeAmongKeys"))
            .toBe(undefined);

      // Hidden property modified
      wetDocument.shouldNotBeAmongKeys = true;

      // New property added on the wet side
      wetDocument.extra = 6;

      let secondKeySet = Object.keys(dryDocument);
      fixKeys(secondKeySet);
      expect(secondKeySet.length).toBe(firstKeySet.length);
      let count = Math.min(firstKeySet.length, secondKeySet.length);
      for (let i = 0; i < count; i++)
        expect(secondKeySet[i]).toBe(firstKeySet[i]);
      expect(Reflect.getOwnPropertyDescriptor(dryDocument, "shouldNotBeAmongKeys"))
            .toBe(undefined);
      expect(Reflect.getOwnPropertyDescriptor(dryDocument, "extra"))
            .toBe(undefined);
    }
  });
}
