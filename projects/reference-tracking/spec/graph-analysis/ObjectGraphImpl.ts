import type {
  Graph
} from "@dagrejs/graphlib";

import {
  ObjectGraphImpl
} from "../../source/graph-analysis/ObjectGraphImpl.js";

import {
  createValueDescription,
} from "../../source/graph-analysis/createValueDescription.js";

import type {
  CloneableGraphIfc
} from "../../source/graph-analysis/types/CloneableGraphIfc.js";

import type {
  ObjectGraphIfc,
} from "../../source/graph-analysis/types/ObjectGraphIfc.js";

import {
  EdgePrefix,
  ValueDiscrimant,
} from "../../source/utilities/constants.js";

describe("ObjectGraphImpl", () => {
  class ObjectMetadata {
    readonly id?: string;
    readonly type = "ObjectMetadata";
    constructor(id?: string) {
      this.id = id;
    }
  }

  class RelationshipMetadata {
    readonly id?: string;
    readonly type = "RelationshipMetadata";
    constructor(id?: string) {
      this.id = id;
    }
  }

  let target: object;
  let heldValues: object[];

  const targetMetadata = new ObjectMetadata("target");
  const heldValuesMetadata = new ObjectMetadata("heldValues");

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

  describe("lets us define", () => {
    it("array indices", () => {
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

      const targetEdgeMetadata = new RelationshipMetadata("heldValues to target");

      objectGraph.defineReference(heldValues, 0, firstValue, new RelationshipMetadata);
      const heldToTarget = objectGraph.defineReference(heldValues, 1, target, targetEdgeMetadata);
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

      expect(objectGraph.getEdgeRelationship(heldToTarget)).toEqual({
        edgeType: EdgePrefix.PropertyKey,
        description: createValueDescription(1, objectGraph),

        metadata: targetEdgeMetadata
      });
    });

    it("object properties with string keys", () => {
      const middleValue = { target };
      heldValues.push(middleValue);

      objectGraph.defineObject(middleValue, new ObjectMetadata);

      const heldToMiddle = new RelationshipMetadata("held values to middle value");
      objectGraph.defineReference(heldValues, 0, middleValue, heldToMiddle);

      const middleToTargetMeta = new RelationshipMetadata("middle value to target");
      const middleToTarget = objectGraph.defineReference(middleValue, "target", target, middleToTargetMeta);

      expect(objectGraph.getEdgeRelationship(middleToTarget)).toEqual({
        edgeType: EdgePrefix.PropertyKey,
        description: createValueDescription("target", objectGraph),

        metadata: middleToTargetMeta
      });
    });

    it("object properties with symbol keys", () => {
      const symbolKey = Symbol("key");
      const middleValue = { [symbolKey]: target };
      heldValues.push(middleValue);

      objectGraph.defineObject(middleValue, new ObjectMetadata);

      const heldToMiddle = new RelationshipMetadata("held values to middle value");
      objectGraph.defineReference(heldValues, 0, middleValue, heldToMiddle);

      const middleToTargetMeta = new RelationshipMetadata("middle value to target");
      const middleToTarget = objectGraph.defineReference(middleValue, symbolKey, target, middleToTargetMeta);

      expect(objectGraph.getEdgeRelationship(middleToTarget)).toEqual({
        edgeType: EdgePrefix.PropertyKey,
        description: createValueDescription(symbolKey, objectGraph),

        metadata: middleToTargetMeta
      });
    });

    it("objects with internal slots", () => {
      const middleValue = {};
      heldValues.push(middleValue);

      objectGraph.defineObject(middleValue, new ObjectMetadata);

      const heldToMiddle = new RelationshipMetadata("held values to middle value");
      objectGraph.defineReference(heldValues, 0, middleValue, heldToMiddle);

      const middleToTargetMeta = new RelationshipMetadata("middle value to target");
      const middleToTarget = objectGraph.defineInternalSlot(
        middleValue, "[[WeakRefTarget]]", target, false, middleToTargetMeta
      );

      expect(objectGraph.getEdgeRelationship(middleToTarget)).toEqual({
        edgeType: EdgePrefix.InternalSlot,
        description: createValueDescription("[[WeakRefTarget]]", objectGraph),

        metadata: middleToTargetMeta
      });
    });

    it("maps with keys and values", () => {
      const map = {}, key = {}, value = {};
      heldValues.push(map);
      objectGraph.defineObject(map, new ObjectMetadata("map"));

      const heldToMap = new RelationshipMetadata("held values to map");
      objectGraph.defineReference(heldValues, 0, map, heldToMap);

      objectGraph.defineObject(key, new ObjectMetadata("key"));
      objectGraph.defineObject(value, new ObjectMetadata("value"));

      const valueMetadata = new RelationshipMetadata("value metadata");

      const {
        tupleNodeId,
        mapToTupleEdgeId,
        tupleToKeyEdgeId,
        tupleToValueEdgeId
      } = objectGraph.defineMapKeyValueTuple(
        map, key, value, false, valueMetadata
      );

      expect(objectGraph.getEdgeRelationship(mapToTupleEdgeId)).toEqual({
        edgeType: EdgePrefix.MapToTuple,
        description: {
          valueType: ValueDiscrimant.NotApplicable
        },
        metadata: null
      });

      expect(tupleToKeyEdgeId).toBeDefined();
      if (tupleToKeyEdgeId) {
        expect(objectGraph.getEdgeRelationship(tupleToKeyEdgeId)).toEqual({
          edgeType: EdgePrefix.MapKey,
          description: createValueDescription(key, objectGraph),
          metadata: null,
        });
      }

      expect(objectGraph.getEdgeRelationship(tupleToValueEdgeId)).toEqual({
        edgeType: EdgePrefix.MapValue,
        description: createValueDescription(value, objectGraph),
        metadata: valueMetadata
      });

      const rawGraph = cloneableGraph.cloneGraph();
      const inEdges = rawGraph.inEdges(tupleNodeId);
      expect(inEdges).toBeDefined();
      if (inEdges) {
        expect(inEdges.length).toBe(1);
        expect(inEdges[0]?.name).toBe(mapToTupleEdgeId);
      }

      const outEdges = rawGraph.outEdges(tupleNodeId);
      expect(outEdges).toBeDefined();
      if (outEdges) {
        expect(outEdges.length).toBe(2);
        expect(outEdges[0]?.name).toBe(tupleToKeyEdgeId);
        expect(outEdges[1]?.name).toBe(tupleToValueEdgeId);
      }
    });

    it("sets with values", () => {
      const middleValue = {};
      heldValues.push(middleValue);

      objectGraph.defineObject(middleValue, new ObjectMetadata);

      const heldToMiddle = new RelationshipMetadata("held values to middle value");
      objectGraph.defineReference(heldValues, 0, middleValue, heldToMiddle);

      const middleToTargetMeta = new RelationshipMetadata("middle value to target");
      const middleToTarget = objectGraph.defineSetValue(middleValue, target, true, middleToTargetMeta);

      expect(objectGraph.getEdgeRelationship(middleToTarget)).toEqual({
        edgeType: EdgePrefix.SetValue,
        description: {
          valueType: ValueDiscrimant.NotApplicable,
        },

        metadata: middleToTargetMeta
      });
    });

    it("multiple references to a value", () => {
      heldValues.push(target, target);

      const firstIndexMetadata = new RelationshipMetadata("first index");
      const secondIndexMetadata = new RelationshipMetadata("second index");
      const firstEdge = objectGraph.defineReference(heldValues, 0, target, firstIndexMetadata);
      const secondEdge = objectGraph.defineReference(heldValues, 1, target, secondIndexMetadata);

      expect(objectGraph.getEdgeRelationship(firstEdge)).toEqual({
        edgeType: EdgePrefix.PropertyKey,
        description: createValueDescription(0, objectGraph),

        metadata: firstIndexMetadata
      });

      expect(objectGraph.getEdgeRelationship(secondEdge)).toEqual({
        edgeType: EdgePrefix.PropertyKey,
        description: createValueDescription(1, objectGraph),

        metadata: secondIndexMetadata
      });
    });
  });

  describe("throws for", () => {
    xit("unknown objects", () => {

    });

    xit("defining an object twice", () => {

    });

    describe("passing in an unknown object to", () => {
      xit("defineReference", () => {

      });

      xit("defineInternalSlot", () => {

      });

      xit("defineMapKeyValueTuple", () => {
      });

      xit("defineSetValue", () => {

      });

      xit("markStrongReference", () => {

      });

      xit("hasStrongReference", () => {

      });

      xit("isReachable", () => {

      });
    });
  });
});
