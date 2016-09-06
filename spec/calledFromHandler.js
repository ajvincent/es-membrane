"use strict"
/*
import "../dist/es6-modules/Membrane.js";
import "../dist/es6-modules/MembraneMocks.js";
*/

if ((typeof Membrane != "function") || (typeof MembraneMocks != "function")) {
  if (typeof require == "function") {
    var { Membrane } = require("../dist/node/es7-membrane.js");
    var { MembraneMocks } = require("../dist/node/mocks.js");
  }
}

if ((typeof Membrane != "function") || (typeof MembraneMocks != "function")) {
  throw new Error("Unable to run tests");
}

/* XXX ajvincent This test will break when we secure the exported Membrane
 * constructor via source/dogfood.js.
 */
it(
  "A Membrane is always aware when it is in its own code, versus code it wraps",
  function() {
    function isInternal() {
      let rv = false;

      // emulating what callback will do to the handlerStack
      dryWetMB.handlerStack.unshift("test");
      rv = dryWetMB.calledFromHandlerTrap();
      dryWetMB.handlerStack.shift();

      return rv;
    }
    
    function replaceMethodWithLog(membrane, obj, propName) {
      let callback = obj[propName];
      obj[propName] = function() {
        isInTrap = isInternal();
        return callback.apply(this, arguments);
      };
    }

    let parts, dryHandler, dryWetMB, dryDocument, isInTrap;
    parts = MembraneMocks();
    dryWetMB = parts.membrane;
    dryHandler = dryWetMB.getHandlerByField("dry");
    dryDocument = parts.dry.doc;

    expect(isInternal()).toBe(false);
    dryDocument.insertBefore(dryDocument.rootElement, null);
    expect(isInternal()).toBe(false);

    replaceMethodWithLog(dryWetMB, dryHandler, "getOwnPropertyDescriptor");
    {
      Object.getOwnPropertyDescriptor(dryDocument, "firstChild");
      expect(isInternal()).toBe(false);
      expect(isInTrap).toBe(false);
    }

    {
      void(dryDocument.firstChild);
      expect(isInternal()).toBe(false);
      expect(isInTrap).toBe(true);
    }

    dryDocument.addEventListener("testEvent", function() {
      expect(isInternal()).toBe(false);
      isInTrap = false;

      Object.getOwnPropertyDescriptor(dryDocument, "firstChild");
      expect(isInternal()).toBe(false);
      expect(isInTrap).toBe(false);

      void(dryDocument.firstChild);
      expect(isInternal()).toBe(false);
      expect(isInTrap).toBe(true);
    }, true);

    isInTrap = false;
    dryDocument.dispatchEvent("testEvent");
    expect(isInternal()).toBe(false);
    expect(isInTrap).toBe(true);
  }
);
