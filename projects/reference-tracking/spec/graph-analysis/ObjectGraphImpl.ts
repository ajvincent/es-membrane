//#region preamble
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

import type {
  SearchReferencesIfc,
} from "source/graph-analysis/types/SearchReferencesIfc.js";

import {
  EdgePrefix,
  ValueDiscrimant,
} from "../../source/utilities/constants.js";
//#endregion preamble

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
  let heldValues: WeakKey[];

  const targetMetadata = new ObjectMetadata("target");
  const heldValuesMetadata = new ObjectMetadata("heldValues");

  /* If you're wondering "why have the same object in three variables", this is
  to enforce the interface boundaries.  After all, I expect to pass the object
  graph to different API's. */
  let cloneableGraph: CloneableGraphIfc;
  let objectGraph: ObjectGraphIfc<
    object,
    symbol,
    Record<"type", "ObjectMetadata">,
    Record<"type", "RelationshipMetadata">
  >;
  let searchReferences: SearchReferencesIfc;

  beforeEach(() => {
    target = { "is target": true };
    heldValues = [];

    const graph = new ObjectGraphImpl<
      Record<"type", "ObjectMetadata">,
      Record<"type", "RelationshipMetadata">
    >;

    graph.defineTargetAndHeldValues(
      target, targetMetadata, heldValues, heldValuesMetadata
    );
    cloneableGraph = graph;
    objectGraph = graph;
    searchReferences = graph;
  });

  describe("lets us define", () => {
    it("array indices", () => {
      const firstValue = {}, lastValue = Symbol("last value");
      heldValues.push(firstValue, target, lastValue);

      expect(objectGraph.hasObject(firstValue)).toBeFalse();
      expect(objectGraph.hasObject(target)).toBeTrue();
      expect(objectGraph.hasSymbol(lastValue)).toBeFalse();
      expect(objectGraph.hasObject(heldValues)).toBeTrue();

      objectGraph.defineObject(firstValue, new ObjectMetadata);
      objectGraph.defineSymbol(lastValue, new ObjectMetadata);

      expect(objectGraph.hasObject(firstValue)).toBeTrue();
      expect(objectGraph.hasSymbol(lastValue)).toBeTrue();

      const targetEdgeMetadata = new RelationshipMetadata("heldValues to target");

      objectGraph.defineProperty(heldValues, 0, firstValue, new RelationshipMetadata);
      const heldToTarget = objectGraph.defineProperty(heldValues, 1, target, targetEdgeMetadata);
      objectGraph.defineProperty(heldValues, 2, lastValue, new RelationshipMetadata);

      expect(objectGraph.getWeakKeyId(target)).toBe("target:0");
      expect(objectGraph.getWeakKeyId(heldValues)).toBe("heldValues:1");
      expect(objectGraph.getWeakKeyId(firstValue)).toBe("object:2");
      expect(objectGraph.getWeakKeyId(lastValue)).toBe("symbol:3");

      const rawGraph: Graph = cloneableGraph.cloneGraph();

      expect(rawGraph.nodeCount()).toBe(4);
      expect(rawGraph.hasNode(objectGraph.getWeakKeyId(target)));
      expect(rawGraph.hasNode(objectGraph.getWeakKeyId(heldValues)));
      expect(rawGraph.hasNode(objectGraph.getWeakKeyId(firstValue)));
      expect(rawGraph.hasNode(objectGraph.getWeakKeyId(lastValue)));

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
      objectGraph.defineProperty(heldValues, 0, middleValue, heldToMiddle);

      const middleToTargetMeta = new RelationshipMetadata("middle value to target");
      const middleToTarget = objectGraph.defineProperty(middleValue, "target", target, middleToTargetMeta);

      expect(objectGraph.getEdgeRelationship(middleToTarget)).toEqual({
        edgeType: EdgePrefix.PropertyKey,
        description: createValueDescription("target", objectGraph),

        metadata: middleToTargetMeta
      });
    });

    it("object properties with symbol keys", () => {
      const symbolKey = Symbol("key");
      objectGraph.defineSymbol(symbolKey, new ObjectMetadata);

      const middleValue = { [symbolKey]: target };
      heldValues.push(middleValue);

      objectGraph.defineObject(middleValue, new ObjectMetadata);

      const heldToMiddle = new RelationshipMetadata("held values to middle value");
      objectGraph.defineProperty(heldValues, 0, middleValue, heldToMiddle);

      const middleToTargetMeta = new RelationshipMetadata("middle value to target");
      const middleToTarget = objectGraph.defineProperty(middleValue, symbolKey, target, middleToTargetMeta);

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
      objectGraph.defineProperty(heldValues, 0, middleValue, heldToMiddle);

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

    describe("maps with", () => {
      const map = {}, key = {}, value = {};
      const heldToMap = new RelationshipMetadata("held values to map");

      const keyMetadata = new RelationshipMetadata("key metadata");
      const valueMetadata = new RelationshipMetadata("value metadata");

      beforeEach(() => {
        heldValues.push(map);
        objectGraph.defineObject(map, new ObjectMetadata("map"));
  
        objectGraph.defineProperty(heldValues, 0, map, heldToMap);
      });

      it("object keys and object values", () => {
        objectGraph.defineObject(key, new ObjectMetadata("key"));
        objectGraph.defineObject(value, new ObjectMetadata("value"));

        const {
          tupleNodeId,
          mapToTupleEdgeId,
          tupleToKeyEdgeId,
          tupleToValueEdgeId
        } = objectGraph.defineMapKeyValueTuple(
          map, key, value, false, keyMetadata, valueMetadata
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
            metadata: keyMetadata,
          });
        }

        expect(tupleToValueEdgeId).toBeDefined();
        if (tupleToValueEdgeId) {
          expect(objectGraph.getEdgeRelationship(tupleToValueEdgeId)).toEqual({
            edgeType: EdgePrefix.MapValue,
            description: createValueDescription(value, objectGraph),
            metadata: valueMetadata
          });
        }

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

      it("primitive keys and object values", () => {
        objectGraph.defineObject(value, new ObjectMetadata("value"));

        const {
          tupleNodeId,
          mapToTupleEdgeId,
          tupleToKeyEdgeId,
          tupleToValueEdgeId
        } = objectGraph.defineMapKeyValueTuple(
          map, "key", value, true, undefined, valueMetadata
        );

        expect(objectGraph.getEdgeRelationship(mapToTupleEdgeId)).toEqual({
          edgeType: EdgePrefix.MapToTuple,
          description: {
            valueType: ValueDiscrimant.NotApplicable
          },
          metadata: null
        });

        expect(tupleToKeyEdgeId).toBeUndefined();

        expect(tupleToValueEdgeId).toBeDefined();
        if (tupleToValueEdgeId) {
          expect(objectGraph.getEdgeRelationship(tupleToValueEdgeId)).toEqual({
            edgeType: EdgePrefix.MapValue,
            description: createValueDescription(value, objectGraph),
            metadata: valueMetadata
          });
        }

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
          expect(outEdges.length).toBe(1);
          expect(outEdges[0]?.name).toBe(tupleToValueEdgeId);
        }
      });

      it("object keys and primitive values", () => {
        objectGraph.defineObject(key, new ObjectMetadata("key"));

        const {
          tupleNodeId,
          mapToTupleEdgeId,
          tupleToKeyEdgeId,
          tupleToValueEdgeId
        } = objectGraph.defineMapKeyValueTuple(
          map, key, "value", false, keyMetadata, undefined
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
            metadata: keyMetadata,
          });
        }

        expect(tupleToValueEdgeId).toBeUndefined();

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
          expect(outEdges.length).toBe(1);
          expect(outEdges[0]?.name).toBe(tupleToKeyEdgeId);
        }
      });
    });

    it("sets with values", () => {
      const middleValue = {};
      heldValues.push(middleValue);

      objectGraph.defineObject(middleValue, new ObjectMetadata);

      const heldToMiddle = new RelationshipMetadata("held values to middle value");
      objectGraph.defineProperty(heldValues, 0, middleValue, heldToMiddle);

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

    describe("finalization registry entries", () => {
      xit("including the target, held value (object) and unregister token", () => {

      });

      xit("including the target and held value (object)", () => {

      });

      xit("including the target and held value (primitive)", () => {

      });

      xit("including the target, which is also the unregister token", () => {

      });
    });

    it("multiple references to a value", () => {
      heldValues.push(target, target);

      const firstIndexMetadata = new RelationshipMetadata("first index");
      const secondIndexMetadata = new RelationshipMetadata("second index");
      const firstEdge = objectGraph.defineProperty(heldValues, 0, target, firstIndexMetadata);
      const secondEdge = objectGraph.defineProperty(heldValues, 1, target, secondIndexMetadata);

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

  describe("marks references to target objects as", () => {
    it("strong in a regular map", () => {
      const map = {}, key = {}, value = {};
      heldValues.push(map);
      objectGraph.defineObject(map, new ObjectMetadata("map"));

      const heldToMap = new RelationshipMetadata("held values to map");
      objectGraph.defineProperty(heldValues, 0, map, heldToMap);

      objectGraph.defineObject(key, new ObjectMetadata("key"));
      objectGraph.defineObject(value, new ObjectMetadata("value"));

      const keyMetadata = new RelationshipMetadata("key metadata");
      const valueMetadata = new RelationshipMetadata("value metadata");

      objectGraph.defineMapKeyValueTuple(
        map, key, value, true, keyMetadata, valueMetadata
      );

      searchReferences.markStrongReferencesFromHeldValues();
      expect(searchReferences.isKeyHeldStrongly(map)).withContext("map").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(key)).withContext("key").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(value)).withContext("value").toBeTrue();
    });

    it("weak in a weak map with no references to the key", () => {
      const map = {}, key = {}, value = {};
      heldValues.push(map);
      objectGraph.defineObject(map, new ObjectMetadata("map"));

      const heldToMap = new RelationshipMetadata("held values to map");
      objectGraph.defineProperty(heldValues, 0, map, heldToMap);

      objectGraph.defineObject(key, new ObjectMetadata("key"));
      objectGraph.defineObject(value, new ObjectMetadata("value"));

      const keyMetadata = new RelationshipMetadata("key metadata");
      const valueMetadata = new RelationshipMetadata("value metadata");

      objectGraph.defineMapKeyValueTuple(
        map, key, value, false, keyMetadata, valueMetadata
      );

      searchReferences.markStrongReferencesFromHeldValues();
      expect(searchReferences.isKeyHeldStrongly(map)).withContext("map").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(key)).withContext("key").toBeFalse();
      expect(searchReferences.isKeyHeldStrongly(value)).withContext("value").toBeFalse();
    });

    it("strong in a weak map with another reference to the key", () => {
      const map = {}, key = {}, value = {};
      heldValues.push(map, key);
      objectGraph.defineObject(map, new ObjectMetadata("map"));
      objectGraph.defineObject(key, new ObjectMetadata("key"));

      const heldToMap = new RelationshipMetadata("held values to map");
      objectGraph.defineProperty(heldValues, 0, map, heldToMap);
      objectGraph.defineProperty(heldValues, 1, key, new RelationshipMetadata("held values to key"));


      objectGraph.defineObject(value, new ObjectMetadata("value"));

      const keyMetadata = new RelationshipMetadata("key metadata");
      const valueMetadata = new RelationshipMetadata("value metadata");

      objectGraph.defineMapKeyValueTuple(
        map, key, value, false, keyMetadata, valueMetadata
      );

      searchReferences.markStrongReferencesFromHeldValues();
      expect(searchReferences.isKeyHeldStrongly(map)).withContext("map").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(key)).withContext("key").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(value)).withContext("value").toBeTrue();
    });

    it("strong when a chain of ownership is established", () => {
      /*
      const target = {};
  
      const A = new WeakRef(target);
      const B = new WeakMap<object, object>;
      const C = {"name": "C" };
      const E = {"name": "E" };
  
      B.set(C, target);
      B.set(E, C);

      const heldValues = [ A, B, E ];
      searchReferences("foo", target, heldValues, true);
      */

      // presumed by objectGraph: const target = {};

      const A = {"name": "A"}, B = {"name": "B"}, C = {"name": "C"}, E = {"name": "E"};
  
      /*
      const heldValues = [A, B, E];
      const C = {"name": "C" };
      const E = {"name": "E" };
      */
      objectGraph.defineObject(A, new ObjectMetadata);
      objectGraph.defineProperty(heldValues, 0, A, new RelationshipMetadata);
  
      objectGraph.defineObject(B, new ObjectMetadata);
      objectGraph.defineProperty(heldValues, 1, B, new RelationshipMetadata);

      objectGraph.defineObject(E, new ObjectMetadata);
      objectGraph.defineProperty(heldValues, 2, E, new RelationshipMetadata);
  
      // const A = new WeakRef(target);
      objectGraph.defineInternalSlot(A, "[[WeakRefTarget]]", target, false, new RelationshipMetadata);
  
      /*
      const B = new WeakMap<object, object>;
      B.set(C, target);
      B.set(E, C);
      */
      objectGraph.defineObject(C, new ObjectMetadata);
      objectGraph.defineMapKeyValueTuple(B, C, target, false, new RelationshipMetadata, new RelationshipMetadata);
      objectGraph.defineMapKeyValueTuple(B, E, C, false, new RelationshipMetadata, new RelationshipMetadata);

      // searchReferences("foo", target, heldvalues, true);
  
      searchReferences.markStrongReferencesFromHeldValues();

      // these tests are in the order I expect them to happen
      expect(searchReferences.isKeyHeldStrongly(heldValues)).withContext("heldValues").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(A)).withContext("A").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(B)).withContext("B").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(E)).withContext("E").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(C)).withContext("C").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(target)).withContext("target").toBeTrue();
    });

    it("weak when no chain of strong ownership exists", () => {
      /*
      const target = {};
  
      const A = new WeakRef(target);
      const B = new WeakMap<object, object>;
      const C = {"name": "C" };
      const E = {"name": "E" };
  
      B.set(C, target);
      //B.set(E, C);
  
      const heldValues = [ A, B, E ];
      searchReferences("foo", target, heldValues, true);
      */
  
      // presumed by objectGraph: const target = {};
  
      const A = {"name": "A"}, B = {"name": "B"}, C = {"name": "C"}, E = {"name": "E"};
  
      /*
      const heldValues = [A, B, E];
      const C = {"name": "C" };
      const E = {"name": "E" };
      */
      objectGraph.defineObject(A, new ObjectMetadata);
      objectGraph.defineProperty(heldValues, 0, A, new RelationshipMetadata);

      objectGraph.defineObject(B, new ObjectMetadata);
      objectGraph.defineProperty(heldValues, 1, B, new RelationshipMetadata);
  
      objectGraph.defineObject(E, new ObjectMetadata);
      objectGraph.defineProperty(heldValues, 2, E, new RelationshipMetadata);
  
      // const A = new WeakRef(target);
      objectGraph.defineInternalSlot(A, "[[WeakRefTarget]]", target, false, new RelationshipMetadata);
  
      /*
      const B = new WeakMap<object, object>;
      B.set(C, target);
      //B.set(E, C);
      */
      objectGraph.defineObject(C, new ObjectMetadata);
      objectGraph.defineMapKeyValueTuple(B, C, target, false, new RelationshipMetadata, new RelationshipMetadata);
      //objectGraph.defineMapKeyValueTuple(B, E, C, false, new RelationshipMetadata);
  
      // searchReferences("foo", target, heldvalues, true);
      searchReferences.markStrongReferencesFromHeldValues();
  
      // these tests are in the order I expect them to happen
      expect(searchReferences.isKeyHeldStrongly(heldValues)).toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(A)).toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(B)).toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(E)).toBeTrue();

      // C should be a weak key of B, but nothing holds C strongly
      // no other references to C
      expect(searchReferences.isKeyHeldStrongly(C)).toBeFalse();

      // target was held weakly by A, so that's not enough to hold the target
      // target was held strongly by B and C combined, but C wasn't held strongly, so that doesn't hold the target either.
      // no other references to target
      expect(searchReferences.isKeyHeldStrongly(target)).toBeFalse();
    });
  });

  describe("marks references to target symbols as", () => {
    it("strong in a regular map", () => {
      const map = {}, key = Symbol("key"), value = Symbol("value");
      heldValues.push(map);
      objectGraph.defineObject(map, new ObjectMetadata("map"));

      const heldToMap = new RelationshipMetadata("held values to map");
      objectGraph.defineProperty(heldValues, 0, map, heldToMap);

      objectGraph.defineSymbol(key, new ObjectMetadata("key"));
      objectGraph.defineSymbol(value, new ObjectMetadata("value"));

      const keyMetadata = new RelationshipMetadata("key metadata");
      const valueMetadata = new RelationshipMetadata("value metadata");

      objectGraph.defineMapKeyValueTuple(
        map, key, value, true, keyMetadata, valueMetadata
      );

      searchReferences.markStrongReferencesFromHeldValues();
      expect(searchReferences.isKeyHeldStrongly(map)).withContext("map").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(key)).withContext("key").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(value)).withContext("value").toBeTrue();
    });

    it("weak in a weak map with no references to the key", () => {
      const map = {}, key = Symbol("key"), value = Symbol("value");
      heldValues.push(map);
      objectGraph.defineObject(map, new ObjectMetadata("map"));

      const heldToMap = new RelationshipMetadata("held values to map");
      objectGraph.defineProperty(heldValues, 0, map, heldToMap);

      objectGraph.defineSymbol(key, new ObjectMetadata("key"));
      objectGraph.defineSymbol(value, new ObjectMetadata("value"));

      const keyMetadata = new RelationshipMetadata("key metadata");
      const valueMetadata = new RelationshipMetadata("value metadata");

      objectGraph.defineMapKeyValueTuple(
        map, key, value, false, keyMetadata, valueMetadata
      );

      searchReferences.markStrongReferencesFromHeldValues();
      expect(searchReferences.isKeyHeldStrongly(map)).withContext("map").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(key)).withContext("key").toBeFalse();
      expect(searchReferences.isKeyHeldStrongly(value)).withContext("value").toBeFalse();
    });

    it("strong in a weak map with another reference to the key", () => {
      const map = {}, key = Symbol("key"), value = Symbol("value");
      heldValues.push(map, key);
      objectGraph.defineObject(map, new ObjectMetadata("map"));
      objectGraph.defineSymbol(key, new ObjectMetadata("key"));

      const heldToMap = new RelationshipMetadata("held values to map");
      objectGraph.defineProperty(heldValues, 0, map, heldToMap);
      objectGraph.defineProperty(heldValues, 1, key, new RelationshipMetadata("held values to key"));

      objectGraph.defineSymbol(value, new ObjectMetadata("value"));

      const keyMetadata = new RelationshipMetadata("key metadata");
      const valueMetadata = new RelationshipMetadata("value metadata");

      objectGraph.defineMapKeyValueTuple(
        map, key, value, false, keyMetadata, valueMetadata
      );

      searchReferences.markStrongReferencesFromHeldValues();
      expect(searchReferences.isKeyHeldStrongly(map)).withContext("map").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(key)).withContext("key").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(value)).withContext("value").toBeTrue();
    });
  });

  describe(".summarizeGraphToTarget", () => {
    const heldToMap = new RelationshipMetadata("held values to map");
    const keyMetadata = new RelationshipMetadata("key metadata");
    const valueMetadata = new RelationshipMetadata("value metadata");

    const map = {}, key = {}, value = {}, targetKey = {};
    beforeEach(() => {
      heldValues.push(map);
      objectGraph.defineObject(map, new ObjectMetadata("map"));

      objectGraph.defineProperty(heldValues, 0, map, heldToMap);

      objectGraph.defineObject(key, new ObjectMetadata("key"));
      objectGraph.defineObject(value, new ObjectMetadata("value"));

      objectGraph.defineObject(targetKey, new ObjectMetadata("target key"));
    });

    it("(true) reduces to strong reference chains to the target", () => {
      objectGraph.defineMapKeyValueTuple(
        map, key, value, true, keyMetadata, valueMetadata
      );
      const {
        tupleNodeId,
        mapToTupleEdgeId,
        tupleToKeyEdgeId,
        tupleToValueEdgeId
      } = objectGraph.defineMapKeyValueTuple(
        map, targetKey, target, true, keyMetadata, valueMetadata
      );

      let graph: Graph = cloneableGraph.cloneGraph();
      const nodeCountBefore = graph.nodeCount();
      const edgeCountBefore = graph.edgeCount();

      // this is really the turning point.
      searchReferences.markStrongReferencesFromHeldValues();

      searchReferences.summarizeGraphToTarget(true);
      graph = cloneableGraph.cloneGraph();

      expect(graph.nodeCount()).toBe(5);
      expect(graph.nodeCount()).toBeLessThan(nodeCountBefore);
      expect(graph.hasNode(objectGraph.getWeakKeyId(target))).toBeTrue();
      expect(graph.hasNode(objectGraph.getWeakKeyId(heldValues))).toBeTrue();
      expect(graph.hasNode(objectGraph.getWeakKeyId(map))).toBeTrue();
      expect(graph.hasNode(objectGraph.getWeakKeyId(targetKey))).toBeTrue();
      expect(graph.hasNode(tupleNodeId)).toBeTrue();

      expect(graph.hasNode(objectGraph.getWeakKeyId(key))).toBeFalse();
      expect(graph.hasNode(objectGraph.getWeakKeyId(value))).toBeFalse();

      expect(graph.edgeCount()).toBeGreaterThan(0);
      expect(graph.edgeCount()).toBeLessThan(edgeCountBefore);

      expect(graph.hasEdge(
        objectGraph.getWeakKeyId(map),
        tupleNodeId,
        mapToTupleEdgeId
      )).withContext("heldValues => map").toBeTrue();

      expect(graph.hasEdge(
        tupleNodeId,
        objectGraph.getWeakKeyId(targetKey),
        tupleToKeyEdgeId
      )).withContext("heldValues => map").toBeTrue();

      expect(graph.hasEdge(
        tupleNodeId,
        objectGraph.getWeakKeyId(target),
        tupleToValueEdgeId
      )).withContext("heldValues => map").toBeTrue();

      expect(
        graph.inEdges(objectGraph.getWeakKeyId(map))
      ).toEqual(
        graph.outEdges(objectGraph.getWeakKeyId(heldValues))
      );
    });

    it("(false) reduces to reference chains to the target", () => {
      objectGraph.defineMapKeyValueTuple(
        map, key, value, false,
        new RelationshipMetadata("other key metadata"),
        new RelationshipMetadata("other value metadata")
      );
      const {
        tupleNodeId,
        mapToTupleEdgeId,
        tupleToKeyEdgeId,
        tupleToValueEdgeId
      } = objectGraph.defineMapKeyValueTuple(
        map, targetKey, target, false, keyMetadata, valueMetadata
      );

      let graph: Graph = cloneableGraph.cloneGraph();
      const nodeCountBefore = graph.nodeCount();
      const edgeCountBefore = graph.edgeCount();

      searchReferences.summarizeGraphToTarget(false);
      graph = cloneableGraph.cloneGraph();

      expect(graph.nodeCount()).toBe(5);
      expect(graph.nodeCount()).toBeLessThan(nodeCountBefore);
      expect(graph.hasNode(objectGraph.getWeakKeyId(target))).toBeTrue();
      expect(graph.hasNode(objectGraph.getWeakKeyId(heldValues))).toBeTrue();
      expect(graph.hasNode(objectGraph.getWeakKeyId(map))).toBeTrue();
      expect(graph.hasNode(objectGraph.getWeakKeyId(targetKey))).toBeTrue();
      expect(graph.hasNode(tupleNodeId)).toBeTrue();

      expect(graph.hasNode(objectGraph.getWeakKeyId(key))).toBeFalse();
      expect(graph.hasNode(objectGraph.getWeakKeyId(value))).toBeFalse();

      expect(graph.edgeCount()).toBeGreaterThan(0);
      expect(graph.edgeCount()).toBeLessThan(edgeCountBefore);

      expect(graph.hasEdge(
        objectGraph.getWeakKeyId(map),
        tupleNodeId,
        mapToTupleEdgeId
      )).withContext("heldValues => map").toBeTrue();

      expect(graph.hasEdge(
        tupleNodeId,
        objectGraph.getWeakKeyId(targetKey),
        tupleToKeyEdgeId
      )).withContext("heldValues => map").toBeTrue();

      expect(graph.hasEdge(
        tupleNodeId,
        objectGraph.getWeakKeyId(target),
        tupleToValueEdgeId
      )).withContext("heldValues => map").toBeTrue();

      expect(
        graph.inEdges(objectGraph.getWeakKeyId(map))
      ).toEqual(
        graph.outEdges(objectGraph.getWeakKeyId(heldValues))
      );
    });

    it("(true) returns an empty graph when there are only weak reference chains to the target", () => {
      objectGraph.defineMapKeyValueTuple(
        map, key, target, false, keyMetadata, valueMetadata
      );

      searchReferences.markStrongReferencesFromHeldValues();

      // we tested summarizeGraphToTarget(false) above.
      searchReferences.summarizeGraphToTarget(true);
      const graph: Graph = cloneableGraph.cloneGraph();
      expect(graph.nodeCount()).toBe(0);
      expect(graph.edgeCount()).toBe(0);
    });

    it("(true) returns an empty graph when the target has no reference chains", () => {
      objectGraph.defineMapKeyValueTuple(
        map, key, value, true, keyMetadata, valueMetadata
      );

      searchReferences.markStrongReferencesFromHeldValues();

      searchReferences.summarizeGraphToTarget(true);
      const graph: Graph = cloneableGraph.cloneGraph();
      expect(graph.nodeCount()).toBe(0);
      expect(graph.edgeCount()).toBe(0);
    });

    it("(false) returns an empty graph when the target has no reference chains", () => {
      objectGraph.defineMapKeyValueTuple(
        map, key, value, false, keyMetadata, valueMetadata
      );

      searchReferences.summarizeGraphToTarget(false);
      const graph: Graph = cloneableGraph.cloneGraph();
      expect(graph.nodeCount()).toBe(0);
      expect(graph.edgeCount()).toBe(0);
    });
  });

  describe("throws for", () => {
    const keyMetadata = new RelationshipMetadata;
    const valueMetadata = new RelationshipMetadata;
    it("unknown objects", () => {
      const unused = {};
      expect(objectGraph.hasObject(unused)).toBe(false);

      expect(
        () => objectGraph.getWeakKeyId(unused)
      ).toThrowError("weakKey is not defined as a node");

      expect(
        () => objectGraph.defineProperty(unused, "foo", target, valueMetadata)
      ).toThrowError("parentObject is not defined as a node");

      expect(
        () => objectGraph.defineProperty(heldValues, "foo", unused, valueMetadata)
      ).toThrowError("childObject is not defined as a node");

      expect(
        () => objectGraph.defineInternalSlot(unused, "[[foo]]", target, false, valueMetadata)
      ).toThrowError("parentObject is not defined as a node");

      expect(
        () => objectGraph.defineInternalSlot(heldValues, "[[foo]]", unused, false, valueMetadata)
      ).toThrowError("childObject is not defined as a node");

      expect(
        () => objectGraph.defineMapKeyValueTuple(unused, heldValues, target, false, keyMetadata, valueMetadata)
      ).toThrowError("map is not defined as a node");

      expect(
        () => objectGraph.defineMapKeyValueTuple(heldValues, unused, target, false, keyMetadata, valueMetadata)
      ).toThrowError("key is not defined as a node");

      expect(
        () => objectGraph.defineMapKeyValueTuple(heldValues, target, unused, false, keyMetadata, valueMetadata)
      ).toThrowError("value is not defined as a node");
    });

    it("defining an object twice", () => {
      expect(
        () => objectGraph.defineObject(target, new ObjectMetadata)
      ).toThrowError("object is already defined as a node in this graph");
    });

    it("defining a non-object as a weak map key", () => {
      expect(
        () => objectGraph.defineMapKeyValueTuple(heldValues, 2, target, false, keyMetadata, valueMetadata)
      ).toThrowError("key must be a WeakKey");
    });
  });
});
