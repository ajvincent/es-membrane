import {
  BuiltInCollectionName,
  ChildReferenceEdgeType,
} from "../utilities/constants.ts";

export interface ReferenceGraphNode {
  readonly objectKey: number;
  readonly builtInClassName: BuiltInCollectionName;
  readonly derivedClassName: string;
}

export interface ChildToParentReferenceGraphEdge {
  readonly childObjectKey: number;
  readonly jointOwnerKeys: number[];
  readonly isStrongOwningReference: boolean;
  readonly parentToChildEdgeId: number,
}

export interface BaseParentToChildReferenceGraphEdge<EdgeType extends ChildReferenceEdgeType> {
  readonly parentObjectKey: number,
  readonly childObjectKey: number,
  readonly parentToChildEdgeType: EdgeType,
  readonly parentToChildEdgeId: number,
}

export interface PropertyNameEdge extends BaseParentToChildReferenceGraphEdge<ChildReferenceEdgeType.PropertyName> {
  readonly propertyName: string;
}

export interface ArrayIndexEdge extends BaseParentToChildReferenceGraphEdge<ChildReferenceEdgeType.ArrayIndex> {
  readonly arrayIndex: number;
}

export interface PropertySymbolEdge extends BaseParentToChildReferenceGraphEdge<ChildReferenceEdgeType.PropertySymbol> {
  readonly symbolDescription: string | undefined;
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
  readonly nodes: ReferenceGraphNode[];
  readonly parentToChildEdges: ParentToChildReferenceGraphEdge[];
  readonly childToParentEdges: ChildToParentReferenceGraphEdge[];

  readonly succeeded: boolean;
  readonly foundTargetValue: boolean;
}
