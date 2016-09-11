"use strict"

/* In almost any JavaScript hierarchy of objects, there are certain properties
 * which the objects need to exist.  (Some turkey may try to redefine them by
 * .defineProperty, but that's a different story.)  The best way to protect your
 * required properties is to define them using Object.defineProperties(), with
 * each individual descriptor having its configurable flag set to false.  The
 * second best way is to use Object.seal() on the object holding those
 * properties.
 *
 * But if you need to be able to delete your properties, and you want to prevent
 * others from deleting them, the requireLocalDelete() method of the ModifyRules
 * API will do.
 */

if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

let MockupsForThisTest = function() {
  // This function you're free to customize any way you want.
  let parts = MembraneMocks();
  return parts;
};

it("Use case:  membrane.modifyRules.requireLocalDelete", function() {
  // Customize this for whatever variables you need.
  var parts = MockupsForThisTest();
  parts.membrane.modifyRules.requireLocalDelete("wet", parts.wet.doc);

  delete parts.dry.doc.__events__;
  expect("__events__" in parts.dry.doc).toBe(false);

  expect("__events__" in parts.wet.doc).toBe(true);

  parts.dry.doc.dispatchEvent("unload");
  expect(function() {
    void(parts.dry.doc.nodeType); 
  }).toThrow();
});
