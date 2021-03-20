"use strict"

/* Suppose I have a whole hierarchy of objects which I wish to expose
 * through the membrane, but I really don't want outsiders setting
 * properties willy-nilly on my code base.  I'm debugging, and all these
 * extra properties are just noise to my objects.
 *
 * The first step I can take to protect myself is to state I will not accept
 * properties I don't know about.  I do this by telling the membrane that I
 * want it to store any properties with an unknown name on the object graph
 * that requested it.
 *
 * I want to do this deep in the prototype chain.  Anything that inherits from
 * an object I control -- and the deepest such objects in my mocks which are
 * directly reachable are instances of NodeWet.  (Yes, there's
 * EventListenerWet... but let's not overcomplicate things.)
 *
 * I suppose if I'm really serious, I could call storeUnknownAsLocal on
 * Object.prototype... but that may be overkill, and whitelisting or
 * blacklisting of properties is probably a better solution anyway.
 */

if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

import ensureProxyCylinder from "../helpers/ensureProxyCylinder.mjs";

{
  it("Use case:  membrane.modifyRules.storeUnknownAsLocal", function() {
    /* XXX ajvincent This is a hack, for a property that shouldn't be in the
       real membrane.
    */
    function fixKeys(keys) {
      if (keys.includes("membraneGraphName"))
        keys.splice(keys.indexOf("membraneGraphName"), 1);
    }

    var dryRoot, wetRoot, wetPropKeys;

    // Internal code, setting up the environment.
    {
      let parts = MembraneMocks();
      let dryWetMB = parts.membrane;
      ensureProxyCylinder(parts.handlers.wet, parts.wet.Node.prototype);
      dryWetMB.modifyRules.storeUnknownAsLocal("wet", parts.wet.Node.prototype);

      wetRoot = parts.wet.doc.rootElement;
      wetPropKeys = Object.keys(wetRoot);
      fixKeys(wetPropKeys);

      dryRoot = parts.dry.doc.rootElement;
    }

    // External code, which this environment only partially controls.
    {
      let firstKeySet = Object.keys(dryRoot);
      fixKeys(firstKeySet);

      dryRoot.factoids = {
        statesInTheUSA: 50,
        baseballTeams: 30
      };
      dryRoot.timestamp = new Date();
      dryRoot.authorName = "John Doe";
      // and other miscellaneous crud

      let secondKeySet = Object.keys(dryRoot);
      fixKeys(secondKeySet);
      expect(secondKeySet.length).toBe(firstKeySet.length + 3);
      for (let i = 0; i < firstKeySet.length; i++) {
        expect(secondKeySet[i]).toBe(firstKeySet[i]);
      }
      secondKeySet = secondKeySet.slice(firstKeySet.length);
      expect(secondKeySet[0]).toBe("factoids");
      expect(secondKeySet[1]).toBe("timestamp");
      expect(secondKeySet[2]).toBe("authorName");
    }

    // Back to internal code, we should see NO changes whatsoever.
    // We check this with Object.keys().
    {
      let keys = Object.keys(wetRoot);
      fixKeys(keys);
      expect(keys.length).toBe(wetPropKeys.length);
      let length = Math.min(keys.length, wetPropKeys.length);
      for (let i = 0; i < length; i++)
        expect(keys[i]).toBe(wetPropKeys[i]);
    }
  });
}
