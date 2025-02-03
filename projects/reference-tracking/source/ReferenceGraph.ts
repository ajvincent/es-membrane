export enum ChildReferenceEdgeType {
  PropertyName = 0,
  ArrayIndex,
  PropertySymbol,
  PrivateClassField,
  InternalSlot,

  // less sure of these
  FunctionClosure,
  BoundFunction,

  // shortcut: foo.bar.baz[0] = wop;
  PropertySequence,
}

export const TARGET_NODE_KEY = 0;
export const PRESUMED_HELD_NODE_KEY = 1;

export interface ChildToParentReferenceGraphEdge {
  readonly jointOwnerKeys: number[];
  readonly childObjectKey: number;
  readonly isStrongOwningReference: boolean;
}

export interface BaseParentToChildReferenceGraphEdge<EdgeType extends ChildReferenceEdgeType> {
  readonly parentObjectKey: number,
  readonly childObjectKey: number,
  readonly childEdgeType: EdgeType,
}

export interface PropertyNameEdge extends BaseParentToChildReferenceGraphEdge<ChildReferenceEdgeType.PropertyName> {
  readonly propertyName: string;
}

export interface ArrayIndexEdge extends BaseParentToChildReferenceGraphEdge<ChildReferenceEdgeType.ArrayIndex> {
  readonly index: number;
}

export interface PropertySymbolEdge extends BaseParentToChildReferenceGraphEdge<ChildReferenceEdgeType.PropertySymbol> {
  readonly symbolInternalKey: string;
  readonly symbolNumericKey: number;
}

export interface PrivateClassFieldEdge extends BaseParentToChildReferenceGraphEdge<ChildReferenceEdgeType.PrivateClassField> {
  readonly classFieldName: `#${string}`;
  readonly className?: string;
  readonly classObjectKey: number;
}

export interface InternalSlotEdge extends BaseParentToChildReferenceGraphEdge<ChildReferenceEdgeType.InternalSlot> {
  readonly slotName: `[[${string}]]`;
}

/** This is a sequence of `PropertyNameEdge` and `ArrayIndexEdge`. */
export interface PropertySequenceShortcutEdge extends BaseParentToChildReferenceGraphEdge<ChildReferenceEdgeType.PropertySequence> {
  readonly propertyNameSequence: (string | number)[];
}

export type ParentToChildReferenceGraphEdge = (
  PropertyNameEdge |
  ArrayIndexEdge |
  PropertySymbolEdge |
  PrivateClassFieldEdge |
  InternalSlotEdge |
  PropertySequenceShortcutEdge |
  never
);

export interface ReferenceGraph {
  readonly parentToChildEdges: ParentToChildReferenceGraphEdge[];
  readonly childToParentEdges: ChildToParentReferenceGraphEdge[];
}
