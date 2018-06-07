function buildMembrane(___utilities___) {
  "use strict";
  
  const rvMembrane = new Membrane({
    logger: (___utilities___.logger || null),
    passThroughFilter: (function() {
      const items = [];
    
      return function() {
        return true;
      };
      {
        const s = new Set(items);
        return s.has.bind(s);
      }
    })(),
    
  });

  {
    const ___graph___ = rvMembrane.getHandlerByName("internal", { mustCreate: true });
    const ___listener___ = rvMembrane.modifyRules.createDistortionsListener();
    ___listener___.addListener(ModifyRulesAPI, "value", {
      "filterOwnKeys": [
        "arguments",
        "caller",
        "length",
        "name",
        "prototype"
      ],
      "proxyTraps": [
        "getPrototypeOf",
        "isExtensible",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "get",
        "set",
        "deleteProperty",
        "ownKeys",
        "apply",
        "construct"
      ],
      "inheritFilter": true,
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false,
      "truncateArgList": false
    });

    ___listener___.addListener(ModifyRulesAPI, "prototype", {
      "filterOwnKeys": [
        "getRealTarget",
        "createChainHandler",
        "replaceProxy",
        "storeUnknownAsLocal",
        "requireLocalDelete",
        "filterOwnKeys",
        "truncateArgList",
        "disableTraps",
        "createDistortionsListener"
      ],
      "proxyTraps": [
        "getPrototypeOf",
        "isExtensible",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "get",
        "set",
        "deleteProperty",
        "ownKeys",
        "apply",
        "construct"
      ],
      "inheritFilter": true,
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.bindToHandler(___graph___);
  }

  {
    rvMembrane.getHandlerByName("public", { mustCreate: true });
  }

  return rvMembrane;
}
