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
    var { MembraneMocks } = require("../../dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

{
  xit("Use case:  membrane.modifyRules.storeUnknownAsLocal", function() {
    var dryRoot, wetRoot, wetPropKeys;

    // Internal code, setting up the environment.
    {
      let parts = MembraneMocks();
      let dryWetMB = parts.membrane;
      dryWetMB.modifyRules.storeUnknownAsLocal("wet", parts.wet.Node);

      wetRoot = parts.wet.doc.rootElement;
      wetPropKeys = Object.keys(wetRoot);

      dryRoot = parts.dry.doc.rootElement;
    }

    // External code, which this environment only partially controls.
    {
      let firstKeySet = Object.keys(dryRoot);

      dryRoot.factoids = {
        statesInTheUSA: 50,
        baseballTeams: 30
      };
      dryRoot.timestamp = new Date();
      dryRoot.authorName = "John Doe";
      // and other miscellaneous crud

      let secondKeySet = Object.keys(dryRoot);
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
      expect(keys.length).toBe(wetPropKeys.length);
      let length = Math.min(keys.length, wetPropKeys.length);
      for (let i = 0; i < length; i++)
        expect(keys[i]).toBe(wetPropKeys[i]);
    }
  });
}
