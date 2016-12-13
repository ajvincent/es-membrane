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
