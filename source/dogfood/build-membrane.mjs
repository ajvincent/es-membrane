import Membrane from "../Membrane.mjs";
import ObjectGraphHandler from "../ObjectGraphHandler-old.mjs";
import DistortionsListener from "../DistortionsListener.mjs";
import ModifyRulesAPI from "../ModifyRulesAPI.mjs";
import {
  ProxyCylinder,
} from "../ProxyCylinder.mjs";
import ProxyNotify from "../ProxyNotify.mjs";

export default function buildMembrane(___utilities___) {
  const rvMembrane = new Membrane({
    logger: (___utilities___.logger || null),
    passThroughFilter: (function() {
      const items = [];

      items.splice(
        0, 0,
        Membrane,
        ObjectGraphHandler,
        DistortionsListener,
        ModifyRulesAPI
      );
      
      return function(value) {
        if ((value === ProxyCylinder) ||
            (value === ProxyCylinder.prototype) ||
            (value instanceof ProxyCylinder))
          throw new Error("ProxyCylinder is private!");
        if (value === ProxyNotify)
          throw new Error("ProxyNotify is private!");
        return !items.some(function(item) {
          if ((value === item) || 
              (value === item.prototype) ||
              (value instanceof item))
            return true;
          const methodKeys = Reflect.ownKeys(item.prototype);
          return methodKeys.some(function(key) {
            return item.prototype[key] === value;
          });
        });
      };
    })(),
    
  });

  {
    const ___graph___ = rvMembrane.getGraphByName("internal", { mustCreate: true });
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
        "construct"
      ],
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false,
      "truncateArgList": true
    });

    ___listener___.addListener(ModifyRulesAPI, "prototype", {
      "filterOwnKeys": [
        "getRealTarget",
        "createChainHandler",
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
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.addListener(ModifyRulesAPI, "instance", {
      "filterOwnKeys": [
        "membrane"
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
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.addListener(Membrane, "value", {
      "filterOwnKeys": [
        "arguments",
        "caller",
        "length",
        "name",
        "prototype",
        "Primordials"
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
        "construct"
      ],
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false,
      "truncateArgList": 1
    });

    ___listener___.addListener(Membrane, "prototype", {
      "filterOwnKeys": [
        "allTraps",
        "hasProxyForValue",
        "getMembraneValue",
        "getMembraneProxy",
        "hasGraphByName",
        "getGraphByName",
        "ownsHandler",
        "convertArgumentToProxy",
        "bindValuesByHandlers",
        "secured",
        "warnOnce"
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
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.addListener(Membrane, "instance", {
      "filterOwnKeys": [
        "modifyRules",
        "passThroughFilter"
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
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.addListener(ObjectGraphHandler, "value", {
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
        "construct"
      ],
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false,
      "truncateArgList": true
    });

    ___listener___.addListener(ObjectGraphHandler, "prototype", {
      "filterOwnKeys": [
        "ownKeys",
        "has",
        "get",
        "getOwnPropertyDescriptor",
        "getPrototypeOf",
        "isExtensible",
        "preventExtensions",
        "deleteProperty",
        "defineProperty",
        "set",
        "setPrototypeOf",
        "apply",
        "construct",
        "addProxyListener",
        "removeProxyListener",
        "revokeEverything"
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
      "storeUnknownAsLocal": false,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.addListener(ObjectGraphHandler, "instance", {
      "filterOwnKeys": [
        "graphName",
        "passThroughFilter",
        "mayReplacePassThrough"
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
      "storeUnknownAsLocal": false,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.addListener(
      [
        ModifyRulesAPI.prototype.getRealTarget,
        ModifyRulesAPI.prototype.createChainHandler,
        ModifyRulesAPI.prototype.storeUnknownAsLocal,
        ModifyRulesAPI.prototype.requireLocalDelete,
        ModifyRulesAPI.prototype.filterOwnKeys,
        ModifyRulesAPI.prototype.truncateArgList,
        ModifyRulesAPI.prototype.disableTraps,
        ModifyRulesAPI.prototype.createDistortionsListener,
        Membrane.prototype.hasProxyForValue,
        Membrane.prototype.getMembraneValue,
        Membrane.prototype.getMembraneProxy,
        Membrane.prototype.hasGraphByName,
        Membrane.prototype.getGraphByName,
        Membrane.prototype.ownsHandler,
        Membrane.prototype.convertArgumentToProxy,
        Membrane.prototype.bindValuesByHandlers,
        Membrane.prototype.warnOnce,
        ObjectGraphHandler.prototype.ownKeys,
        ObjectGraphHandler.prototype.has,
        ObjectGraphHandler.prototype.get,
        ObjectGraphHandler.prototype.getOwnPropertyDescriptor,
        ObjectGraphHandler.prototype.getPrototypeOf,
        ObjectGraphHandler.prototype.isExtensible,
        ObjectGraphHandler.prototype.preventExtensions,
        ObjectGraphHandler.prototype.deleteProperty,
        ObjectGraphHandler.prototype.defineProperty,
        ObjectGraphHandler.prototype.set,
        ObjectGraphHandler.prototype.setPrototypeOf,
        ObjectGraphHandler.prototype.apply,
        ObjectGraphHandler.prototype.construct,
        ObjectGraphHandler.prototype.addProxyListener,
        ObjectGraphHandler.prototype.removeProxyListener,
        DistortionsListener.prototype.addListener,
        DistortionsListener.prototype.removeListener,
        DistortionsListener.prototype.sampleConfig,
        DistortionsListener.prototype.bindToHandler,
        DistortionsListener.prototype.ignorePrimordials,
        DistortionsListener.prototype.applyConfiguration
      ],
      "iterable",
      {
        "filterOwnKeys": null,
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
          "apply"
        ],
        "storeUnknownAsLocal": true,
        "requireLocalDelete": true,
        "useShadowTarget": false
      }
    );

    ___listener___.addListener(DistortionsListener, "value", {
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
        "construct"
      ],
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false,
      "truncateArgList": true
    });

    ___listener___.addListener(DistortionsListener, "prototype", {
      "filterOwnKeys": [
        "addListener",
        "removeListener",
        "sampleConfig",
        "bindToHandler",
        "ignorePrimordials",
        "applyConfiguration"
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
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.addListener(DistortionsListener, "instance", {
      "filterOwnKeys": [],
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
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.bindToHandler(___graph___);
  }

  {
    rvMembrane.getGraphByName("public", { mustCreate: true });
  }

  return rvMembrane;
}
