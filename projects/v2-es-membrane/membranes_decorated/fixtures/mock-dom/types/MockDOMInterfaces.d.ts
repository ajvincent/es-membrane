import {
  MockEventPhase
} from "../MockEventPhase.js";

export type MockEventCallbackIfc = (evt: MockEventIfc) => void;
export type MockEventListenerIfc = Record<"handleEvent", MockEventCallbackIfc>;

export interface MockEventHandlerIfc {
  readonly type: string;
  readonly listener: MockEventListenerIfc;
  readonly isBubbling: boolean;
}

export interface MockEventIfc {
  readonly type: string;
  readonly currentPhase: MockEventPhase;
}

export interface MockEventTargetIfc {
  addEventListener(
    type: string,
    listener: MockEventCallbackIfc | MockEventListenerIfc,
    isBubbling: boolean
  ): void;

  dispatchEvent(eventType: string): void;
}

export interface MockNodeIfc<NodeType extends number = number> extends MockEventTargetIfc {
  readonly childNodes: MockNodeIfc[];
  parentNode: MockNodeIfc | null;
  readonly nodeType: NodeType;
  readonly ownerDocument: MockDocumentIfc | null;
  readonly wetMarker: Record<"marker", string>;
}

export interface MockElementIfc extends MockNodeIfc<1> {
  readonly ownerDocument: MockDocumentIfc;
  insertBefore(newChild: MockNodeIfc, refChild: MockNodeIfc | null): MockNodeIfc;
}

export interface MockDocumentIfc extends MockNodeIfc<9> {
  readonly ownerDocument: null;
  rootElement: MockElementIfc;
  createElement: (
    this: DocumentWet,
    name: string
  ) => MockElementIfc;
}
