import dagre, {
  Label,
  Edge,
} from "@dagrejs/dagre";

import type {
  ReadonlyDeep
} from "type-fest";

import type {
  ChildToParentReferenceGraphEdge,
  ParentToChildReferenceGraphEdge,
  ReferenceGraph,
  ReferenceGraphNode,
} from "../types/ReferenceGraph.js";

export function buildDagreGraph(
  referenceGraph: ReadonlyDeep<ReferenceGraph>
): dagre.graphlib.Graph
{
  const dagreGraph: dagre.graphlib.Graph = new dagre.graphlib.Graph({
    directed: true,
    multigraph: true,
  });

  // Set an object for the graph label
  dagreGraph.setGraph({});

  for (const node of referenceGraph.nodes) {
    const objLabel = new ObjectLabel(node);
    dagreGraph.setNode(objLabel.label, objLabel);
  }

  for (const parentEdge of referenceGraph.parentToChildEdges) {
    const edge = new ParentGraphEdge(parentEdge);
    dagreGraph.setEdge(edge, parentEdge);
  }

  for (const childEdge of referenceGraph.childToParentEdges) {
    const jointLabel = new JointOwnershipLabel(childEdge);
    dagreGraph.setNode(jointLabel.label, jointLabel);
    {
      const edge = new ChildNodeToJointOwnersEdge(childEdge, jointLabel);
      dagreGraph.setEdge(edge, jointLabel);
    }
    for (let i = 0; i < childEdge.jointOwnerKeys.length; i++) {
      const edge = new JointOwnersToParentEdge(childEdge, jointLabel, i);
      dagreGraph.setEdge(edge, jointLabel);
    }
  }

  dagre.layout(dagreGraph);
  return dagreGraph;
}

class ObjectLabel implements Label {
  static getLabel(
    this: void,
    objectKey: number
  ): string
  {
    return "object:" + objectKey;
  }

  width = 100;
  height = 100;

  label: string;

  constructor(
    refNode: ReadonlyDeep<ReferenceGraphNode>
  )
  {
    this.label = ObjectLabel.getLabel(refNode.objectKey);
  }
}

class ParentGraphEdge implements Edge {
  readonly v: string;
  readonly w: string;
  readonly name: string;

  constructor(
    parentToChildEdge: ReadonlyDeep<ParentToChildReferenceGraphEdge>
  )
  {
    this.v = ObjectLabel.getLabel(parentToChildEdge.parentObjectKey);
    this.w = ObjectLabel.getLabel(parentToChildEdge.childObjectKey);
    this.name = "parentToChild:" + parentToChildEdge.parentToChildEdgeId;
  }
}

class JointOwnershipLabel implements Label {
  width = 50;
  height = 50;

  label: string;

  constructor(
    childToParentEdge: ReadonlyDeep<ChildToParentReferenceGraphEdge>
  )
  {
    this.label = "joint-owners:" + childToParentEdge.childObjectKey;
  }
}

class ChildNodeToJointOwnersEdge implements Edge {
  readonly v: string;
  readonly w: string;
  readonly name: string;

  constructor(
    childToParentEdge: ReadonlyDeep<ChildToParentReferenceGraphEdge>,
    jointOwnersLabel: JointOwnershipLabel,
  )
  {
    this.v = ObjectLabel.getLabel(childToParentEdge.childObjectKey);
    this.w = jointOwnersLabel.label;

    this.name = "child-to-joint-owners:" + childToParentEdge.childObjectKey;
  }
}

class JointOwnersToParentEdge implements Edge {
  readonly v: string;
  readonly w: string;

  readonly name: string

  constructor(
    childToParentEdge: ReadonlyDeep<ChildToParentReferenceGraphEdge>,
    jointOwnersLabel: JointOwnershipLabel,
    index: number,
  )
  {
    const parentKey = childToParentEdge.jointOwnerKeys[index];
    this.v = jointOwnersLabel.label;
    this.w = ObjectLabel.getLabel(parentKey);

    this.name = "joint-owners-to-parent:" + parentKey;
  }
}
