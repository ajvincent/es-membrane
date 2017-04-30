"use strict"
/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/

if ((typeof Membrane != "function") || (typeof MembraneMocks != "function")) {
  if (typeof require == "function") {
    var { Membrane } = require("../docs/dist/node/es7-membrane.js");
    var { MembraneMocks } = require("../docs/dist/node/mocks.js");
  }
}

if ((typeof Membrane != "function") || (typeof MembraneMocks != "function")) {
  throw new Error("Unable to run tests");
}

// Disabled; this code no longer seems necessary.
xit(
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

    /*
    XXX ajvincent I expect, as we begin to secure the Membrane constructor and
    friends against tampering, that a "secured" flag will be set irrevocably to
    true, which will make calling isInternal() impossible.

    if (dryWetMB.secured)
      return;
    */
    expect(dryWetMB.secured).toBe(false);

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
