describe("Internal values are not exposed:  ", function() {
  const GLOBAL = (typeof global == "object") ? global : window;
  const PRIVATE_KEYS = 
  [
    // source/moduleUtilities.js
    "valueType",
    "ShadowKeyMap",
    "makeShadowTarget",
    "getRealTarget",
    "inGraphHandler",
    "NOT_YET_DETERMINED",
    "makeRevokeDeleteRefs",
    "MembraneMayLog",
    "AssertIsPropertyKey",
    "Constants",

    // source/ProxyMapping.js
    "ProxyMapping",

    // source/Membrane.js
    "MembraneInternal",

    // source/ObjectGraphHandler.js
    "ObjectGraphHandler",

    // source/ProxyNotify.js
    "ProxyNotify",

    // source/ModifyRulesAPI.js
    "ChainHandlers",
    "ChainHandlerProtection",
    "ModifyRulesAPI",

    // source/dogfood.js
    "DogfoodMembrane",
  ];
  PRIVATE_KEYS.forEach(function(name) {
    it(name, function() {
      expect(name in GLOBAL).toBe(false);
    });
  });
});
