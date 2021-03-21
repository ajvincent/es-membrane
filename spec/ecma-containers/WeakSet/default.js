/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/
if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

it(
  "Set instances by default in a membrane work like they do without a membrane",
  function() {
    "use strict";
  
    let membrane, wetHandler, dryHandler, dampHandler, wetSet, drySet, dampSet;
    {
      const MUSTCREATE = Object.freeze({ mustCreate: true });
      membrane = new Membrane();
      wetHandler  = membrane.getHandlerByName("wet", MUSTCREATE);
      dryHandler  = membrane.getHandlerByName("dry", MUSTCREATE);
      dampHandler = membrane.getHandlerByName("damp", MUSTCREATE);
  
      wetSet  = new WeakSet();
      drySet  = membrane.convertArgumentToProxy(wetHandler, dryHandler,  wetSet);
      // we rarely create proxies this way in our tests, so this'll be useful
      dampSet = membrane.convertArgumentToProxy(dryHandler, dampHandler, drySet);
    }
  
    function checkSet(set, values, shouldHave = true) {
      values.forEach(function(value) {
        expect(set.has(value)).toBe(shouldHave);
      });
    }
  
    const dryValue1 = {}, dryValue2 = {};
    drySet.add(dryValue1);
    checkSet(drySet, [dryValue1], true);
    checkSet(drySet, [dryValue2], false);
  
    const wetValue1 = {};
    wetSet.add(wetValue1);
    checkSet(drySet, [dryValue1], true);
    checkSet(drySet, [dryValue2], false);
    checkSet(wetSet, [wetValue1], true);
  
    drySet.add(dryValue2);
    checkSet(drySet, [dryValue1, dryValue2], true);
    checkSet(wetSet, [wetValue1], true);  

    // deleting a key it doesn't have
    drySet.delete({});
    checkSet(drySet, [dryValue1, dryValue2], true);
    checkSet(wetSet, [wetValue1], true);  

    drySet.delete(dryValue1);
    checkSet(drySet, [dryValue1], false);
    checkSet(drySet, [dryValue2], true);
    checkSet(wetSet, [wetValue1], true);
  }
);
