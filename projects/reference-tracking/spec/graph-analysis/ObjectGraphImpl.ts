import type {
  Graph
} from "@dagrejs/graphlib";

import {
  ObjectGraphImpl
} from "../../source/graph-analysis/ObjectGraphImpl.js";

import type {
  CloneableGraphIfc
} from "../../source/graph-analysis/types/CloneableGraphIfc.js";

import type {
  ObjectGraphIfc,
} from "../../source/graph-analysis/types/ObjectGraphIfc.js";

describe("ObjectGraphImpl", () => {
  class ObjectMetadata {
    readonly type = "ObjectMetadata";
  }
  class RelationshipMetadata {
    readonly type = "RelationshipMetadata";
  }

  let target: object;
  let heldValues: object[];

  const targetMetadata = new ObjectMetadata;
  const heldValuesMetadata = new ObjectMetadata;

  let cloneableGraph: CloneableGraphIfc;
  let objectGraph: ObjectGraphIfc<
    Record<"type", "ObjectMetadata">,
    Record<"type", "RelationshipMetadata">
  >;

  beforeEach(() => {
    target = {};
    heldValues = [];

    const graph = new ObjectGraphImpl<
      Record<"type", "ObjectMetadata">,
      Record<"type", "RelationshipMetadata">
    >
    (
      target, targetMetadata, heldValues, heldValuesMetadata
    );
    cloneableGraph = graph;
    objectGraph = graph;
  });

  it("lets us define array members", () => {
    const firstValue = {}, lastValue = {};
    heldValues.push(firstValue, target, lastValue);

    expect(objectGraph.hasObject(firstValue)).toBeFalse();
    expect(objectGraph.hasObject(target)).toBeTrue();
    expect(objectGraph.hasObject(lastValue)).toBeFalse();
    expect(objectGraph.hasObject(heldValues)).toBeTrue();

    objectGraph.defineObject(firstValue, new ObjectMetadata);
    objectGraph.defineObject(lastValue, new ObjectMetadata);

    expect(objectGraph.hasObject(firstValue)).toBeTrue();
    expect(objectGraph.hasObject(lastValue)).toBeTrue();

    objectGraph.defineReference(heldValues, 0, firstValue, new RelationshipMetadata);
    objectGraph.defineReference(heldValues, 1, target, new RelationshipMetadata);
    objectGraph.defineReference(heldValues, 2, lastValue, new RelationshipMetadata);

    expect(objectGraph.getObjectId(target)).toBe("target:0");
    expect(objectGraph.getObjectId(heldValues)).toBe("heldValues:1");
    expect(objectGraph.getObjectId(firstValue)).toBe("object:2");
    expect(objectGraph.getObjectId(lastValue)).toBe("object:3");

    const rawGraph: Graph = cloneableGraph.cloneGraph();

    expect(rawGraph.nodeCount()).toBe(4);
    expect(rawGraph.hasNode(objectGraph.getObjectId(target)));
    expect(rawGraph.hasNode(objectGraph.getObjectId(heldValues)));
    expect(rawGraph.hasNode(objectGraph.getObjectId(firstValue)));
    expect(rawGraph.hasNode(objectGraph.getObjectId(lastValue)));
  });
});
