import type {
  AbstractClass,
  Class
} from "type-fest";

import type {
  MockEventIfc,
  MockEventTargetIfc,
  MockEventHandlerIfc,
  MockEventCallbackIfc,
  MockEventListenerIfc,
  MockNodeIfc,
  MockDocumentIfc,
  MockElementIfc
} from "./types/MockDOMInterfaces.js";

import {
  MockEventPhase
} from "./MockEventPhase.js";

export interface WetDOMMocksIfc {
  readonly NodeWet: AbstractClass<MockNodeIfc, [ MockDocumentIfc | null ]>;
  readonly ElementWet: Class<MockElementIfc, [MockDocumentIfc, string]>;
  readonly wetDocument: MockDocumentIfc;
}

/* The enclosing of classes inside WetDOMMocks is very intentional.  We're going
to be altering prototypes of classes, etc.  So we want a "clean" set of mocks
every time.
*/

export function WetDOMMocks(
  enabledDecorators: ReadonlySet<string>
): Promise<WetDOMMocksIfc>
{
  void enabledDecorators;

  /* Checklist: Be sure to annotate here where we implement one of these.
  -[x] Writable property: NodeWet.ownerDocument
  -[x] Non-writable property: NodeWet.childNodes
  -[x] Getter: ElementWet.prototype.nodeType
  -[x] Setter: NodeWet.count
  -[x] Enumerable: rootElement.childNodes
  -[x] Non-enumerable: NodeWet.count
  -[x] Configurable: rootElement.childNodes
  -[x] Non-configurable: ElementWet::nodeType
  -[x] Method: DocumentWet::insertBefore
  -[x] Prototype: Reflect.getPrototypeof(ElementWet.prototype)
  -[x] Inherited value: DocumentWet::insertBefore
  -[x] Direct property value: NodeWet::name
  -[x] Static class field: NodeWet.count
  -[x] Symbol key: ElementWet::[Symbol.toStringTag]
  */

  class WetEvent implements MockEventIfc {
    readonly type: string;
    #currentPhase: MockEventPhase;

    constructor(type: string) {
      this.type = type;
      this.#currentPhase = MockEventPhase.CAPTURING;
    }

    get currentPhase(): MockEventPhase {
      return this.#currentPhase;
    }

    /** @internal This should not be exposed across a membrane boundary. */
    setAtTarget(): void {
      if (this.#currentPhase !== MockEventPhase.CAPTURING)
        throw new Error("can't set at target");
      this.#currentPhase = MockEventPhase.AT_TARGET;
    }

    /** @internal This should not be exposed across a membrane boundary. */
    setBubbling(): void {
      if (this.#currentPhase !== MockEventPhase.AT_TARGET)
        throw new Error("can't set bubbling");
      this.#currentPhase = MockEventPhase.BUBBLING;
    }
  }

  /* The existence of EventTargetWet and NodeWet as abstract classes we never
  export is not an accident.  I do this to make sure we can correctly look up
  the prototype chain for methods, properties, getters, setters, etc.
  */

  abstract class EventTargetWet implements MockEventTargetIfc {
    readonly _eventHandlers: MockEventHandlerIfc[] = [];
    protected abstract parentNode: NodeWet | null;

    public addEventListener(
      type: string,
      listener: MockEventCallbackIfc | MockEventListenerIfc,
      isBubbling: boolean
    ): void
    {
      if (typeof listener === "function") {
        listener = { handleEvent: listener };
      }

      this._eventHandlers.push({
        type,
        listener,
        isBubbling
      });
    }

    public dispatchEvent(
      eventType: string
    ): void
    {
      let current: NodeWet | null = this.parentNode;
      const chain: NodeWet[] = [];
      while (current) {
        chain.unshift(current);
        current = current.parentNode;
      }

      const event = new WetEvent(eventType);
      for (const eventTarget of chain) {
        eventTarget.#handleEventAtTarget(event);
      }

      event.setAtTarget();
      this.#handleEventAtTarget(event);

      chain.reverse();
      event.setBubbling();
      for (const eventTarget of chain) {
        eventTarget.#handleEventAtTarget(event);
      }
    }

    #handleEventAtTarget(
      event: WetEvent
    ): void
    {
      for (const handler of this._eventHandlers.slice()) {
        if (handler.type !== event.type)
          continue;
        const hCode: number = handler.isBubbling ? 4 - event.currentPhase : event.currentPhase;
        if (hCode === 3)
          continue;
        try {
          handler.listener.handleEvent(event);
        }
        catch (e) {
          void e;
          // do nothing
        }
      }
    }
  }

  const wetMarker = {
    marker: "true",
  };

  abstract class NodeWet extends EventTargetWet implements MockNodeIfc {
    // not a standard property, and we're making it non-enumerable as a result
    static #count: number = 0;
    static get count(): number {
      return this.#count;
    }
    static set count(value: number) {
      this.#count = value;
    }

    // The prototype has accessors which are not implemented.  Instances have a live array.
    get childNodes(): NodeWet[] {
      throw new Error("not implemented");
    }
    set childNodes(childNodes: NodeWet[]) {
      throw new Error("not implemented");
    }

    readonly ownerDocument: DocumentWet | null;
    declare public parentNode: NodeWet | null;
    abstract get nodeType(): number;

    wetMarker: Record<"marker", string>;

    constructor(ownerDoc: DocumentWet | null) {
      super();
      Reflect.defineProperty(this, "childNodes", {
        value: [],
        configurable: true,
        enumerable: true,
        writable: false,
      });
      this.ownerDocument = ownerDoc;

      // testing the set trap in a constructor properly marks a new non-primitive
      // property in the "wet" object graph.
      this.wetMarker = wetMarker;

      NodeWet.#count++;
    }

    get firstChild(): NodeWet | null {
      const { childNodes } = this;
      return childNodes.length > 0 ? childNodes[0] : null;
    }
  }
  Reflect.defineProperty(NodeWet, "count", { enumerable: false });

  class ElementWet extends NodeWet implements MockElementIfc {
    declare public readonly ownerDocument: DocumentWet;
    public parentNode: ElementWet | DocumentWet | null = null;

    public name: string;

    constructor(ownerDoc: DocumentWet, name: string) {
      super(ownerDoc);
      this.name = name;
    }

    get nodeType(): 1 {
      return 1;
    }

    public insertBefore(
      this: ElementWet,
      newChild: NodeWet,
      refChild: NodeWet | null
    ): NodeWet
    {
      if (!(newChild instanceof NodeWet)) {
        throw new Error("insertBefore expects a Node!");
      }
      if ((refChild !== null) && !(refChild instanceof NodeWet)) {
        throw new Error("insertBefore's refChild must be null or a Node!");
      }

      let index: number;

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
  }

  Reflect.defineProperty(ElementWet.prototype, "nodeType", {
    configurable: false,
  });

  class DocumentWet extends NodeWet implements MockDocumentIfc {
    #baseURL: string | undefined;

    /* readonly */ rootElement: ElementWet;
    constructor() {
      super(null);
      this.rootElement = new ElementWet(this, "root");
      this.rootElement.parentNode = this;

      Reflect.defineProperty(this, "rootElement", {
        writable: true,
        enumerable: true,
        // "non-configurable objects cannot gain or lose properties"
        configurable: true
      });
      Reflect.defineProperty(this, "createElement", {
        value: createElement,
        writable: false,
        enumerable: true,
        configurable: true,
      });

      Reflect.defineProperty(this, "ownerDocument", {
        configurable: false,
      });
    }

    declare public readonly ownerDocument: null;
    public readonly parentNode = null;

    declare public readonly createElement: (
      this: DocumentWet,
      name: string
    ) => ElementWet;

    public get nodeType(): 9 {
      return 9;
    }

    get baseURL(): string | undefined {
      return this.#baseURL;
    }

    set baseURL(value: string | undefined) {
      this.#baseURL = value;
    }
  }

  function createElement(
    this: DocumentWet,
    name: string
  ): InstanceType<typeof ElementWet>
  {
    if (typeof name != "string") {
      throw new Error("createElement requires name be a string!");
    }
    return new ElementWet(this, name);
  }

  const wetDocument = new DocumentWet();

  const NodeWetDeclared = NodeWet as AbstractClass<MockNodeIfc, [ MockDocumentIfc | null ]>;
  const ElementWetDeclared = ElementWet as unknown as Class<MockElementIfc, [MockDocumentIfc, string]>;

  return Promise.resolve({
    NodeWet: NodeWetDeclared,
    ElementWet: ElementWetDeclared,
    wetDocument,
  });
}
