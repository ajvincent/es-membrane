import type {
  ReadonlyDeep
} from "type-fest";

import type {
  ArrayIndexEdge,
  ChildToParentReferenceGraphEdge,
  InternalSlotEdge,
  PropertyNameEdge,
  PropertySymbolEdge,
  ReferenceGraph,
  ReferenceGraphNode,
} from "../../source/types/ReferenceGraph.js";

import {
  type BuiltInJSTypeName,
  ChildReferenceEdgeType
} from "../../source/utilities/constants.js";

import {
  ReferenceGraphImpl,
} from "../../source/engine262-tools/search/ReferenceGraphImpl.js";

export const EmptyReferenceGraph: ReadonlyDeep<ReferenceGraph> = {
  nodes: [],
  parentToChildEdges: [],
  childToParentEdges: [],
  collectionToKeyValueEdges: [],
  succeeded: true,
  foundTargetValue: false,
}

export function addObjectToGraphs(
  graph: ReferenceGraphImpl,
  objectKey: number,
  builtInClassName: BuiltInJSTypeName,
  derivedClassName: string,
): void
{
  const node: ReferenceGraphNode = {
    objectKey,
    builtInJSTypeName: builtInClassName,
    derivedClassName,
  };
  graph.nodes.push(node);
}

export function addArrayIndexEdge(
  graph: ReferenceGraphImpl,
  parentObjectKey: number,
  arrayIndex: number,
  childObjectKey: number,
  parentToChildEdgeId: number,
): void
{
  const arrayEdge: ArrayIndexEdge = {
    parentObjectKey,
    arrayIndex,
    childObjectKey,
    parentToChildEdgeId,
    parentToChildEdgeType: ChildReferenceEdgeType.ArrayIndex,
    isStrongOwningReference: true,
  };

  const childToParentEdges: ChildToParentReferenceGraphEdge = {
    childObjectKey,
    jointOwnerKeys: [parentObjectKey],
    parentToChildEdgeId,
    isMarkedStrongEdge: true,
  };

  graph.parentToChildEdges.push(arrayEdge);
  graph.childToParentEdges.push(childToParentEdges);
}

export function addPropertyNameEdge(
  graph: ReferenceGraphImpl,
  parentObjectKey: number,
  propertyName: string,
  childObjectKey: number,
  parentToChildEdgeId: number
): void
{
  const propertyEdge: PropertyNameEdge = {
    parentObjectKey,
    propertyName,
    childObjectKey,
    parentToChildEdgeId,
    isStrongOwningReference: true,
    parentToChildEdgeType: ChildReferenceEdgeType.PropertyName,
  };

  const childToParentEdges: ChildToParentReferenceGraphEdge = {
    childObjectKey,
    jointOwnerKeys: [parentObjectKey],
    parentToChildEdgeId,
    isMarkedStrongEdge: true,
  };

  graph.parentToChildEdges.push(propertyEdge);
  graph.childToParentEdges.push(childToParentEdges);
}

export function addPropertySymbolEdge(
  graph: ReferenceGraphImpl,
  parentObjectKey: number,
  symbolDescription: string | undefined,
  symbolNumericKey: number,
  childObjectKey: number,
  parentToChildEdgeId: number
): void
{
  const propertyEdge: PropertySymbolEdge = {
    parentObjectKey,
    symbolDescription,
    symbolNumericKey,
    childObjectKey,
    parentToChildEdgeId,
    isStrongOwningReference: true,
    parentToChildEdgeType: ChildReferenceEdgeType.PropertySymbol,
  };

  const childToParentEdges: ChildToParentReferenceGraphEdge = {
    childObjectKey,
    jointOwnerKeys: [parentObjectKey],
    parentToChildEdgeId,
    isMarkedStrongEdge: true,
  };

  graph.parentToChildEdges.push(propertyEdge);
  graph.childToParentEdges.push(childToParentEdges);
}

export function addInternalSlotEdge(
  graph: ReferenceGraphImpl,
  parentObjectKey: number,
  slotName: `[[${string}]]`,
  childObjectKey: number,
  parentToChildEdgeId: number,
  isStrongOwningReference: boolean,
): void
{
  const slotEdge: InternalSlotEdge = {
    parentObjectKey,
    slotName,
    childObjectKey,
    parentToChildEdgeId,
    isStrongOwningReference,
    parentToChildEdgeType: ChildReferenceEdgeType.InternalSlot
  };

  const childToParentsEdge: ChildToParentReferenceGraphEdge = {
    childObjectKey,
    jointOwnerKeys: [parentObjectKey],
    parentToChildEdgeId,
    isMarkedStrongEdge: isStrongOwningReference
  };

  graph.parentToChildEdges.push(slotEdge);
  graph.childToParentEdges.push(childToParentsEdge);
}
