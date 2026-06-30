import type {
  MockEventListenerIfc
} from "#membranes_decorated/fixtures/mock-dom/types/MockDOMInterfaces.js";
import {
  WetDOMMocks
} from "#membranes_decorated/fixtures/mock-dom/WetDOM.js";

it("WetDOMMocks is reasonable and has enough to test with", () => {
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

  const { wetDocument, ElementWet } = WetDOMMocks(new Set());
  const { rootElement } = wetDocument;
  {
    const ownerDocDesc = Reflect.getOwnPropertyDescriptor(rootElement, "ownerDocument")!;
    expect(ownerDocDesc.writable).toBeTrue();
  }

  {
    const insertBefore = Reflect.get(rootElement, "insertBefore");
    expect(typeof insertBefore).toBe("function");
  }

  {
    const childNodesDesc = Reflect.getOwnPropertyDescriptor(rootElement, "childNodes")!;
    expect(childNodesDesc.writable).toBeFalse();
    expect(childNodesDesc.enumerable).toBeTrue();
    expect(childNodesDesc.configurable).toBeTrue();
  }

  {
    const nodeTypeDesc = Reflect.getOwnPropertyDescriptor(ElementWet.prototype, "nodeType")!;
    expect(nodeTypeDesc.get).toBeInstanceOf(Function);
    expect(nodeTypeDesc.configurable).toBeFalse();
  }


  const NodeWet = Reflect.getPrototypeOf(ElementWet.prototype)!.constructor;
  expect(NodeWet.name).toBe("NodeWet");
  expect(ElementWet.name).toBe("ElementWetInternal");

  {
    const countDescriptor = Reflect.getOwnPropertyDescriptor(NodeWet, "count")!;
    expect(countDescriptor.set).toBeInstanceOf(Function);
    expect(countDescriptor.enumerable).toBeFalse();
  }

  expect(typeof Reflect.get(rootElement, Symbol.toStringTag)).toBe("string");

  // Test that wetDocument behaves reasonably
  const lastChild = wetDocument.createElement("lastChild");
  rootElement.insertBefore(lastChild, null);

  const firstChild = wetDocument.createElement("firstChild");
  rootElement.insertBefore(firstChild, lastChild);

  expect(rootElement.childNodes).toEqual([firstChild, lastChild]);

  const wetDocumentCapturing = jasmine.createSpy("wetDocumentCapturing");
  const wetDocumentBubbling = jasmine.createSpy("wetDocumentBubbling");

  const rootCapturing = jasmine.createSpyObj<MockEventListenerIfc>("rootCapturing", ["handleEvent"], []);
  const rootBubbling = jasmine.createSpy("rootBubbling");
  const firstAtTarget = jasmine.createSpy("firstAtTarget");

  wetDocument.addEventListener("testEvent", wetDocumentCapturing, false);
  wetDocument.addEventListener("testEvent", wetDocumentBubbling, true);
  rootElement.addEventListener("testEvent", rootCapturing, false);
  rootElement.addEventListener("testEvent", rootBubbling, true);
  firstChild.addEventListener("testEvent", firstAtTarget, true);

  firstChild.dispatchEvent("testEvent");

  expect(wetDocumentCapturing).toHaveBeenCalledTimes(1);
  expect(wetDocumentCapturing).toHaveBeenCalledBefore(rootCapturing.handleEvent);
  expect(rootCapturing.handleEvent).toHaveBeenCalledTimes(1);
  expect(rootCapturing.handleEvent).toHaveBeenCalledBefore(firstAtTarget);
  expect(firstAtTarget).toHaveBeenCalledTimes(1);
  expect(firstAtTarget).toHaveBeenCalledBefore(rootBubbling);
  expect(rootBubbling).toHaveBeenCalledTimes(1);
  expect(rootBubbling).toHaveBeenCalledBefore(wetDocumentBubbling);
  expect(wetDocumentBubbling).toHaveBeenCalledTimes(1);
});
