import {
  type ArrayIndexEdge,
  type BuiltInCollectionName,
  ChildReferenceEdgeType,
  type ChildToParentReferenceGraphEdge,
  type PropertyNameEdge,
  type ReferenceGraphNode,
} from "../../source/ReferenceGraph.js";

import {
  ReferenceGraphImpl,
} from "../../source/engine262-tools/search/ReferenceGraphImpl.js";

export function addObjectToGraphs(
  graph: ReferenceGraphImpl,
  objectKey: number,
  builtInClassName: BuiltInCollectionName,
  derivedClassName: string,
): void
{
  const node: ReferenceGraphNode = {
    objectKey,
    builtInClassName,
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
  };

  const childToParentEdges: ChildToParentReferenceGraphEdge = {
    childObjectKey,
    jointOwnerKeys: [parentObjectKey],
    isStrongOwningReference: true,
    parentToChildEdgeId
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
    parentToChildEdgeType: ChildReferenceEdgeType.PropertyName,
  };

  const childToParentEdges: ChildToParentReferenceGraphEdge = {
    childObjectKey,
    jointOwnerKeys: [parentObjectKey],
    isStrongOwningReference: true,
    parentToChildEdgeId
  };

  graph.parentToChildEdges.push(propertyEdge);
  graph.childToParentEdges.push(childToParentEdges);
}
