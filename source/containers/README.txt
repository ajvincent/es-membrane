This is placeholder text until it can be properly moved into the es-membrane wiki.

Example 1:

```javascript
const membrane = new Membrane({ containers: "hideByDefault" /* or "showByDefault" });
// wetHandler, dryHandler created as normal

const wetM = new Map(), wetDocument = {}, wetFoo = {};
wetM.set(wetDocument, wetFoo);

const dryM = membrane.convertArgumentToProxy(wetHandler, dryHandler, wetM);
const dryDocument = membrane.convertArgumentToProxy(wetHandler, dryHandler, wetDocument);

const dryBar = {};
dryM.set(dryDocument, dryBar);

/* if showByDefault, this happens:
   wetM.set(
     wetDocument,
     membrane.convertArgumentToProxy(dryHandler, wetHandler, dryBar),
   );
   else if not hideByDefault, behavior is not clear
*/

expect(dryM.get(dryDocument)).toBe(dryBar);

/* if showByDefault */
expect(wetM.get(wetDocument).not.toBe(wetFoo));
/* else if hideByDefault */
expect(wetM.get(wetDocument)).toBe(wetFoo);
/* else behavior is not clear */

wetM.set(wetDocument, wetFoo);

/* if showByDefault */
expect(dryM.get(dryDocument)).toBe(
  membrane.convertArgumentToProxy(dryHandler, wetHandler, wetFoo)
);
/* else if hideByDefault */
expect(dryM.get(dryDocument)).toBe(dryBar);
/* else behavior is not clear */
```

Example 2:
```javascript
const membrane = new Membrane({ containers: "hideByDefault" /* or "showByDefault" */ });
// wetHandler, dryHandler, dampHandler created as normal

const wetArray = [wetAlpha, wetBeta, wetGamma, wetPi, wetChi];
const dryArray = membrane.convertArgumentToProxy(wetHandler, dryHandler, wetArray);

// some changes happen to wetArray
// some changes happen to dryArray
// some changes happen to wetArray
// what should wetArray look like?
// what version should dryArray look like?

const dampArray = membrane.convertArgumentToProxy(wetHandler, dampHandler, wetArray);
// what version should dampArray look like?
```

Example 3:
```javascript
const membrane = new Membrane({ containers: "hideByDefault" /* or "showByDefault" */ });
// wetHandler, dryHandler, dampHandler created as normal

const wetArray = wetHandler.getContainerProxy([wetAlpha, wetBeta, wetGamma, wetPi, wetChi]);
const dryArray = membrane.convertArgumentToProxy(wetHandler, dryHandler, wetArray);

// some changes happen to wetArray
// some changes happen to dryArray
// some changes happen to wetArray
// what should wetArray look like?
// what version should dryArray look like?

const dampArray = membrane.convertArgumentToProxy(wetHandler, dampHandler, wetArray);
// what version should dampArray look like?
```

If hideByDefault is the selected option:
- updates wetArray makes shouldn't propagate to dryArray or dampArray
- updates dryArray makes shouldn't propagate to wetArray or dampArray
- each array derives from the original, which is owned by a private object graph of the membrane


- The Membrane configuration will include an option, "containers" = "hideByDefault", "showByDefault".  Hide by default means if we look up a container's property in an object graph, and the object graph is not granted permission to show the property, then a "hide property" rule applies.  Show by default means if the object graph is not denied permission to show the property, then a "show property" rule applies.  These rules will be defined below.
- Each container (Map, Set, WeakMap, WeakSet, Array) will need to be wrapped in at least two levels of proxies.    The outer level is the typical membrane proxy.  The inner level is a proxy which manages access to the container's elements.
- For Map, the simplest case, there would be a WhiteListMapBase object which implements an API similar to the Map API:

```javascript
function WhiteListMapBase(originHandler, originMap) {
  // private values
  this.originMap = originMap;
  this.graphAndKeyMap = new WeakMap(/*
    graph: new Map(key: value)
  */);
  this.originHandler = originHandler; // instanceof ObjectGraphHandler
  Object.freeze(this);
};

WhiteListMapBase.prototype.set = function(graphShadowTarget, key, value) {
  if (this.passThrough(graphShadowTarget)) {
    this.originMap.set(key, value);
  }
  else {
    if (!this.graphAndKeyMap.has(graphShadowTarget) {
      this.graphAndKeyMap.set(graphShadowTarget, new WeakMap());
    }
    this.graphAndKeyMap.get(graphShadowTarget).set(key, value);
  }

  return this;
};

WhiteListMapBase.prototype.get = function(graphShadowTarget, key) {
  if (this.passThrough(graphShadowTarget)) {
    return this.originMap.get(key);
  }
  if (!this.graphAndKeyMap.has(graphShadowTarget) {
    return undefined;
  }
  return this.graphAndKeyMap.get(graphShadowTarget).get(key);
};

// similar two-level deep API's for delete, iterator methods of Map

WhiteListMapBase.prototype.passThrough = function(shadowTarget) {
  if (this.membrane.containerOption == "showByDefault")
    return true;
  if (this.originGraph.containerOption == "hideByDefault")
    return false;
  const targetGraph = this.membrane.getHandlerForShadow(shadowTarget);
  return (targetGraph.containerOption == "showByDefault");
};
```

- Each wrapping object graph gets a WhiteListMapForGraph object, with this pseudocode implementation:
```javascript
function WhiteListMapForGraph(shadowTarget, mapBase) {
  // private variables
  this.shadowTarget = shadowTarget;
  this.mapBase = mapBase; /* WhiteListMapBase instance */
}

{
  Reflect.ownKeys(Map.prototype).forEach(function(trap) {
    this.mapBase[trap] = function() {
      const argList = [this.shadowTarget].concat(arguments);
      return this.mapBase[trap].apply(this.mapBase, argList);
    };
  }, WhiteListMapForGraph.prototype);
}
```

- Because the membrane was created with the containers option, we apply a special rule:
const mapAPIForGraph = new WhiteListMapForGraph()
membrane.bindValuesByHandlers(
  originGraph, Map.prototype,
  targetGraph, WhiteListMapForGraph.prototype
);

How this is supposed to work:
# At proxy creation time (ProxyListener), the Map instance is detected for wrapping.
```javascript
let mapBase;
const isNewMap = membrane.cylinderMap.has(originalMap)
if (!isNewMap) {
  mapBase = new WhiteListMapBase(originHandler, originalMap);
}
else {
  mapBase = membrane.getMembraneProxy(originHandler.graphName, originalMap);
}

const whiteListMap = new WhiteListMapForGraph(proxyMeta.shadowTarget, mapBase);
proxyMeta.target = whiteListMap;
proxyMeta.rebuildProxy();
proxyMeta.stopIteration();

// store a reference to the original map so we can find its 
if (!isNewMap) {
  membrane.cylinderMap.set(originalMap, mapBase);
}
```
# The membrane then returns a Proxy to whiteListMap as the target graph's equivalent to
the original Map.
# When the user calls `whiteListMap.set(foo, "bar")`, this should be equivalent to calling
`mapBase.set(shadowTarget, foo, "bar")`;
# If the pass-through is supported, this means also calling `originalMap.set(foo, "bar");`.
# Otherwise, the value is stored first by object graph, then by the desired map key.
