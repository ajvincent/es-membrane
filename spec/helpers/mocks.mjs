import {
  AccessorDescriptor,
  DataDescriptor,
  assert,
} from "../../source/core/sharedUtilities.mjs";

import Membrane from "../../source/core/Membrane.mjs";

import DAMP from "./dampSymbol.mjs";

const wetMarker = {
  marker: "true"
};

function NOT_IMPLEMENTED() {
  throw new Error("Not implemented!");
}

const NOT_IMPLEMENTED_DESC = new AccessorDescriptor(
  NOT_IMPLEMENTED,
  NOT_IMPLEMENTED
);

export default function MembraneMocks(mockOptions = {}) {

class EventTargetWet {
  constructor() {
    this.__events__ = [];
  }

  addEventListener(type, listener, isBubbling) {
    if (typeof listener == "function") {
      listener = { handleEvent: listener };
    }
    if ((typeof listener !== "object") ||
        (listener === null) ||
        (typeof listener.handleEvent !== "function"))
      throw new Error("Invalid event listener!");
    this.__events__.push({
      type: type,
      listener: listener,
      isBubbling: Boolean(isBubbling)
    });
  }

  dispatchEvent(eventType) {
    let current = this.parentNode;
    let chain = [];
    while (current) {
      chain.unshift(current);
      current = current.parentNode;
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
  }

  handleEventAtTarget(event) {
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
  }
}

class NodeWet extends EventTargetWet {
  constructor(ownerDoc) {
    super();
    Reflect.defineProperty(this, "childNodes", new DataDescriptor([]));
    Reflect.defineProperty(this, "ownerDocument", new DataDescriptor(ownerDoc));
    Reflect.defineProperty(this, "parentNode", new DataDescriptor(null, true));

    // testing the set trap in a constructor properly marks a new non-primitive
    // property in the "wet" object graph.
    this.wetMarker = wetMarker;
  }

  insertBefore(newChild, refChild) {
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

  firstChild() {
    if (this.childNodes.length > 0) {
      return this.childNodes[0];
    }
    return null;
  }
}
Object.defineProperties(NodeWet.prototype, {
  "childNodes": NOT_IMPLEMENTED_DESC,
  "nodeType": NOT_IMPLEMENTED_DESC,
  "parentNode": NOT_IMPLEMENTED_DESC,

  "shouldNotBeAmongKeys": new DataDescriptor(false),
});

class ElementWet extends NodeWet {
  constructor(ownerDoc, name) {
    super(ownerDoc, name);
    Reflect.defineProperty(this, "nodeType", new DataDescriptor(1));
    Reflect.defineProperty(this, "nodeName", new DataDescriptor(name));
  }
}

// A sample object for developing the Membrane module with.

/* XXX ajvincent Don't make this object inherit from any prototypes.
 * Instead, test prototype inheritance through ElementWet.
 */

function defineWetDocument(Mocks) {
  let docBaseURL = "http://www.example.com/";

  const wetDocument = {
    ownerDocument: null,

    childNodes: [],
    nodeType: 9,
    nodeName: "#document",
    parentNode: null,

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
    addEventListener: EventTargetWet.prototype.addEventListener,
    dispatchEvent: EventTargetWet.prototype.dispatchEvent,
    handleEventAtTarget: EventTargetWet.prototype.handleEventAtTarget,

    shouldNotBeAmongKeys: false,

    membraneGraphName: "wet" // faking it for now
  };

  Reflect.defineProperty(wetDocument, "createElement", new DataDescriptor(
    function(name) {
      if (typeof name != "string") {
        throw new Error("createElement requires name be a string!");
      }
      return new ElementWet(this, name);
    }
  ));

  Reflect.defineProperty(wetDocument, "insertBefore", new DataDescriptor(
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
  ));

  Reflect.defineProperty(
    wetDocument,
    "rootElement",
    new DataDescriptor(wetDocument.createElement("root"))
  );

  Mocks.wet = {
    doc: wetDocument,
    Node: NodeWet,
    Element: ElementWet,
  };
}

function defineMembrane(Mocks, logger, mockOptions) {
  // First, set up the membrane, and register the "wet" form of "the document".
  let dryWetMB, wetHandler;
  {
    const options = {
      showGraphName: true,
      logger: ((typeof logger == "object") ? logger : null),
    };
    if (mockOptions.refactor)
      options.refactor = mockOptions.refactor;
    dryWetMB = new Membrane(options);
  }

  Mocks.membrane = dryWetMB;
  Mocks.handlers = {};

  {
    // Establish "wet" view of document.
    wetHandler = dryWetMB.getHandlerByName("wet", { mustCreate: true });
    Mocks.handlers.wet = wetHandler;
    // Mocks.wet is established in wetDocument.js

    if (typeof mockOptions.wetHandlerCreated == "function")
      mockOptions.wetHandlerCreated(wetHandler, Mocks);
  }
}

function defineDryDocument(Mocks, logger, mockOptions) {
  const dryWetMB = Mocks.membrane,
        wetHandler = Mocks.handlers.wet,
        wetDocument = Mocks.wet.doc;

  // The "dry" part of the membrane's wet document.
  var ElementDry, NodeDry, dryDocument;
  {
    // Establish proxy handler for "dry" mode.
    let dryHandler = dryWetMB.getHandlerByName("dry", { mustCreate: true });
    Mocks.handlers.dry = dryHandler;
    Mocks.dry = {};

    if (typeof mockOptions.dryHandlerCreated == "function")
      mockOptions.dryHandlerCreated(dryHandler, Mocks);

    let found, doc;

    dryWetMB.convertArgumentToProxy(wetHandler, dryHandler, wetDocument);

    [found, doc] = dryWetMB.getMembraneValue("dry", wetDocument);
    assert(found, "Must find dryDocument from membrane wrapping of wetDocument");
    assert(doc === wetDocument, "Expected to get back the wet document");

    [found, doc] = dryWetMB.getMembraneProxy("dry", wetDocument);
    assert(found, "Must find dryDocument from membrane wrapping of wetDocument");
    assert(doc, "Expected to get back a proxy");
    assert(doc !== wetDocument, "Expected to get back the proxy for the wet document");
    dryDocument = doc;

    dryDocument.addEventListener("unload", function() {
      if ((typeof logger == "object") && (logger !== null))
        logger.debug("Revoking all proxies in dry object graph");
      dryHandler.revokeEverything();
      if ((typeof logger == "object") && (logger !== null))
        logger.debug("Revoked all proxies in dry object graph");
    }, true);

    Mocks.dry.doc = dryDocument;
  }

  {
    let dryHandler = dryWetMB.getHandlerByName("dry");
    dryWetMB.convertArgumentToProxy(wetHandler, dryHandler, ElementWet);
    let found;
    [found, ElementDry] = dryWetMB.getMembraneProxy("dry", ElementWet);
    assert(found, "ElementDry not found as a proxy!");

    Mocks.dry.Element = ElementDry;
  }

  {
    let dryHandler = dryWetMB.getHandlerByName("dry");
    dryWetMB.convertArgumentToProxy(wetHandler, dryHandler, NodeWet);
    let found;
    [found, NodeDry] = dryWetMB.getMembraneProxy("dry", NodeWet);
    assert(found, "NodeDry not found as a proxy!");

    Mocks.dry.Node = NodeDry;
  }
}

function dampObjectGraph(parts, mockOptions) {
  parts.handlers[DAMP] = parts.membrane.getHandlerByName(
    DAMP, { mustCreate: true }
  );

  if (typeof mockOptions.dampHandlerCreated == "function")
    mockOptions.dampHandlerCreated(parts.handlers[DAMP], parts);

  let keys = Object.getOwnPropertyNames(parts.wet);
  parts[DAMP] = {};
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    parts[DAMP][key] = parts.membrane.convertArgumentToProxy(
      parts.handlers.wet,
      parts.handlers[DAMP],
      parts.wet[key]
    );
  }
}

  const includeDamp = Boolean(mockOptions.includeDamp);
  const logger = mockOptions.logger || null;

  const Mocks = {};

  defineWetDocument(Mocks);
  defineMembrane(Mocks, logger, mockOptions);
  defineDryDocument(Mocks, logger, mockOptions);

  if (includeDamp)
    dampObjectGraph(Mocks, mockOptions);

  return Mocks;
}
