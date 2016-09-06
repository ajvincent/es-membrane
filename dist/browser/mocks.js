"use strict"
function MembraneMocks(includeDamp) {
  "use strict";
  includeDamp = Boolean(includeDamp);
function EventListenerWet() {
  this.__events__ = [];
}
EventListenerWet.prototype.addEventListener = function(type, listener, isBubbling) {
  if (typeof listener == "function") {
    listener = { handleEvent: listener };
  }
  if ((typeof listener !== "object") || (typeof listener.handleEvent !== "function"))
    throw new Error("Invalid event listener!");
  this.__events__.push({
    type: type,
    listener: listener,
    isBubbling: Boolean(isBubbling)
  });
};

EventListenerWet.prototype.dispatchEvent = function(eventType) {
  let current = this.parentNode;
  let chain = [];
  while (current) {
    chain.unshift(current);
  }

  let event = {
    type: eventType,
    currentPhase: 1
  };

  for (let i = 0; i < chain.length; i++)
    chain[i].handleEventAtTarget(event);

  event.currentPhase = 2;
  this.handleEventAtTarget(event);

  chain = chain.reverse();
  event.currentPhase = 3;
  for (let i = 0; i < chain.length; i++)
    chain[i].handleEventAtTarget(event);
};

EventListenerWet.prototype.handleEventAtTarget = function(event) {
  let handlers = this.__events__.slice(0);
  let length = handlers.length;
  for (let i = 0; i < length; i++) {
    let h = handlers[i];
    if (h.type !== event.type)
      continue;
    let hCode = (h.isBubbling) ? 4 - event.currentPhase : event.currentPhase;
    if (hCode === 3)
      continue;
    try {
      h.listener.handleEvent(event);
    }
    catch (e) {
      // do nothing
    }
  }
};

const wetMarker = {
  marker: "true"
};

function NodeWet(ownerDoc) {
  EventListenerWet.apply(this, arguments); // this takes care of event handling
  Object.defineProperty(this, "childNodes", new DataDescriptor([]));
  Object.defineProperty(this, "ownerDocument", new DataDescriptor(ownerDoc));
  Object.defineProperty(this, "parentNode", new DataDescriptor(null, true));

  // testing the set trap in a constructor properly marks a new non-primitive
  // property in the "wet" object graph.
  this.wetMarker = wetMarker;
}
NodeWet.prototype = new EventListenerWet();
Object.defineProperties(NodeWet.prototype, {
  "childNodes": NOT_IMPLEMENTED_DESC,
  "nodeType": NOT_IMPLEMENTED_DESC,
  "parentNode": NOT_IMPLEMENTED_DESC,
  "insertBefore": new DataDescriptor(
    function(newChild, refChild) {
      if (!(newChild instanceof NodeWet)) {
        throw new Error("insertBefore expects a Node!");
      }
      if ((refChild !== null) && !(refChild instanceof NodeWet)) {
        throw new Error("insertBefore's refChild must be null or a Node!");
      }

      var index;
      if (refChild) {
        index = this.childNodes.indexOf(refChild);
      }
      else {
        index = this.childNodes.length;
      }
    
      if (index >= 0) {
        this.childNodes.splice(index, 0, newChild);
        newChild.parentNode = this;
        return newChild;
      }

      throw new Error("refChild is not a child of this node!");
    }
  ),
  "firstChild": new AccessorDescriptor(function() {
      if (this.childNodes.length > 0) {
        return this.childNodes[0];
      }
      return null;
    }
  ),

  "shouldNotBeAmongKeys": new DataDescriptor(false),
});

function ElementWet(ownerDoc, name) {
  NodeWet.apply(this, arguments); // this takes care of ownerDoc
  Object.defineProperty(this, "nodeType", new DataDescriptor(1));
  Object.defineProperty(this, "nodeName", new DataDescriptor(name));
}
ElementWet.prototype = new NodeWet(null);

{
  assert(Object.getPrototypeOf(ElementWet.prototype) === NodeWet.prototype,
         "prototype chain mismatch of ElementWet");
  let k = new ElementWet({}, "k");
  assert(Object.getPrototypeOf(k) === ElementWet.prototype,
         "prototype chain mismatch of a created ElementWet instance");
}
// A sample object for developing the Membrane module with.

/* XXX ajvincent Don't make this object inherit from any prototypes.
 * Instead, test prototype inheritance through ElementWet.
 */

const wetDocument = {
  // ownerDocument will be defined momentarily.  See below.
  ownerDocument: null,

  childNodes: [],
  nodeType: 9,
  nodeName: "#document",
  parentNode: null,

  createElement: function(name) {
    if (typeof name != "string") {
      throw new Error("createElement requires name be a string!");
    }
    return new ElementWet(this, name);
  },

  insertBefore: function(newChild, refChild) {
    if (!(newChild instanceof NodeWet)) {
      throw new Error("insertBefore expects a Node!");
    }
    if ((refChild !== null) && !(refChild instanceof NodeWet)) {
      throw new Error("insertBefore's refChild must be null or a Node!");
    }
    var index;
    if (refChild) {
      index = this.childNodes.indexOf(refChild);
    }
    else {
      index = this.childNodes.length;
    }
    
    if (index >= 0) {
      this.childNodes.splice(index, 0, newChild);
      return newChild;
    }

    throw new Error("refChild is not a child of this node!");
  },

  get firstChild() {
    if (this.childNodes.length > 0) {
      return this.childNodes[0];
    }
    return null;
  },

  get baseURL() {
    return docBaseURL;
  },
  set baseURL(val) {
    if (typeof val != "string")
      throw new Error("baseURL must be a string");
    docBaseURL = val;
  },

  // EventListener
  __events__: [],
  addEventListener: EventListenerWet.prototype.addEventListener,
  dispatchEvent: EventListenerWet.prototype.dispatchEvent,
  handleEventAtTarget: EventListenerWet.prototype.handleEventAtTarget,

  shouldNotBeAmongKeys: false,

  membraneGraphName: "wet" // faking it for now
};
/* We can get away with a var declaration here because everything is inside a
   closure.
*/
var docBaseURL = "http://www.example.com/";

Object.defineProperty(
  wetDocument,
  "rootElement",
  {
    value: wetDocument.createElement("root"),
    writable: false,
    enumerable: true,
    // "non-configurable objects cannot gain or lose properties"
    configurable: true
  }
);

assert(wetDocument.rootElement.ownerDocument == wetDocument,
       "wetDocument cyclic reference isn't correct");
// First, set up the membrane, and register the "wet" form of "the document".
var docMap, wetHandler;
var dryWetMB = new Membrane({
  showGraphName: true,
  logger: ((typeof logger == "object") ? logger : null),
});

{
  // Establish "wet" view of document.
  wetHandler = dryWetMB.getHandlerByField("wet", true);
  
  let [found, doc] = dryWetMB.getMembraneValue("wet", wetDocument);
  assert(!found, "wetDocument should not be known");

  docMap = dryWetMB.buildMapping("wet", wetDocument);
  [found, doc] = dryWetMB.getMembraneValue("wet", wetDocument);
  assert(found, "wetDocument was not found?");
  assert(doc === wetDocument, "wetDocument was not retrieved?");
}

{
  dryWetMB.buildMapping("wet", NodeWet);
  dryWetMB.buildMapping("wet", ElementWet);
}
// The "dry" part of the membrane's wet document.
var ElementDry, NodeDry, dryDocument;
{
  // Establish proxy handler for "dry" mode.
  let dryHandler = dryWetMB.getHandlerByField("dry", true);
  let found, doc;

  doc = dryWetMB.wrapArgumentByHandler(dryHandler, wetDocument);
  assert(doc === wetDocument, "Expected to get back the wet document");

  [found, doc] = dryWetMB.getMembraneValue("dry", wetDocument);
  assert(found, "Must find dryDocument from membrane wrapping of wetDocument");
  assert(doc === wetDocument, "Expected to get back the wet document");

  [found, doc] = dryWetMB.getMembraneProxy("dry", wetDocument);
  assert(found, "Must find dryDocument from membrane wrapping of wetDocument");
  assert(doc, "Expected to get back a proxy");
  assert(doc !== wetDocument, "Expected to get back the proxy for the wet document");
  dryDocument = doc;

  dryDocument.addEventListener("unload", function() {
    if (typeof logger == "object")
      logger.debug("Revoking all proxies in dry object graph");
    dryHandler.revokeEverything();
    if (typeof logger == "object")
      logger.debug("Revoked all proxies in dry object graph");
  }, true);
}

{
  let dryHandler = dryWetMB.getHandlerByField("dry");
  dryWetMB.wrapArgumentByHandler(dryHandler, ElementWet);
  let found;
  [found, ElementDry] = dryWetMB.getMembraneProxy("dry", ElementWet);
  assert(found, "ElementDry not found as a proxy!");
}

{
  let dryHandler = dryWetMB.getHandlerByField("dry");
  dryWetMB.wrapArgumentByHandler(dryHandler, NodeWet);
  let found;
  [found, NodeDry] = dryWetMB.getMembraneProxy("dry", NodeWet);
  assert(found, "NodeDry not found as a proxy!");
}
function dampObjectGraph(parts) {
  parts.handlers = {
    "wet":  parts.membrane.getHandlerByField("wet"),
    "dry":  parts.membrane.getHandlerByField("dry"),
    "damp": parts.membrane.getHandlerByField("damp", true),
  };

  let keys = Object.getOwnPropertyNames(parts.wet);
  parts.damp = {};
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    parts.damp[key] = parts.membrane.convertArgumentToProxy(
      parts.handlers.wet,
      parts.handlers.damp,
      parts.wet[key]
    );
  }
}
  // The bare essentials.
  var Mocks = {
    wet: {
      doc: wetDocument,
      Node: NodeWet,
      Element: ElementWet,
    },
    dry: {
      doc: dryDocument,
      Node: NodeDry,
      Element: ElementDry,
    },

    membrane: dryWetMB
  };

  if (includeDamp)
    dampObjectGraph(Mocks);

  return Mocks;
}
