import {
  BuiltInJSTypeName,
  ChildReferenceEdgeType,
} from "../utilities/constants.ts";

import {
  NotApplicableValueDescription,
  ValueDescription
} from "./ValueDescription.d.ts";

export interface ReferenceGraphNode {
  readonly objectKey: number;
  readonly builtInJSTypeName: BuiltInJSTypeName;
  readonly derivedClassName: string;
}

export interface ChildToParentReferenceGraphEdge {
  readonly childObjectKey: number;
  readonly jointOwnerKeys: number[];
  readonly parentToChildEdgeId: number,
  isMarkedStrongEdge: boolean;
}

/**
 * Maps, WeakMaps, Sets and WeakSets are keyed collections.  Their keys and
 * values don't fit cleanly into a parent-edge-child tuple.  So instead of
 * trying to force it in, I define this _third_ edge type specifically for
 * collections.
 *
 * To tie it into the parent-edge-child tuple we use elsewhere, I will define a
 * `CollectionPseudoEdge`, which will be enough to signal this special jump in
 * searching references.
 *
 * The collectionEdgeId property here will equal the `parentToChildEdgeId` of a
 * `CollectionPseudoEdge`.
 *
 * For the top-down search for the target, this is informative.  For the
 * bottom-up search for the held values, this allows us to drop some intermediate
 * information.
 */
export interface CollectionToKeyValueEdge {
  readonly collectionEdgeId: number;
  readonly collectionObjectKey: number;

  /** NotApplicable means we are in a `Set`, not a `Map`. */
  readonly keyDescription: ValueDescription;
  readonly keyIsHeldStrongly: boolean;

  readonly valueDescription: Exclude<ValueDescription, NotApplicableValueDescription>;
}

//#region parent-to-child graph edges

export interface BaseParentToChildReferenceGraphEdge<EdgeType extends ChildReferenceEdgeType> {
  readonly parentObjectKey: number;
  readonly childObjectKey: number;
  readonly parentToChildEdgeType: EdgeType;
  readonly parentToChildEdgeId: number;
  readonly isStrongOwningReference: boolean;
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

export type CollectionPseudoEdge = BaseParentToChildReferenceGraphEdge<ChildReferenceEdgeType.CollectionPseudo>;

export interface PseudoEdgeToObject extends BaseParentToChildReferenceGraphEdge<ChildReferenceEdgeType.PseudoToObject> {
  readonly edgeContext: string[];
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
  CollectionPseudoEdge |
  PseudoEdgeToObject |
  PropertySequenceShortcutEdge |
  never
);

//#endregion parent-to-child graph edges

export interface ReferenceGraph {
  readonly nodes: ReferenceGraphNode[];
  readonly parentToChildEdges: ParentToChildReferenceGraphEdge[];
  readonly childToParentEdges: ChildToParentReferenceGraphEdge[];

  readonly collectionToKeyValueEdges: CollectionToKeyValueEdge[];

  readonly succeeded: boolean;
  readonly foundTargetValue: boolean;
}
