//#region preamble
import type {
  Graph
} from "@dagrejs/graphlib";

import {
  HostObjectGraph,
  ObjectGraphImpl
} from "../../source/graph-analysis/ObjectGraphImpl.js";

import {
  createValueDescription,
} from "../../source/graph-analysis/createValueDescription.js";

import type {
  CloneableGraphIfc
} from "../../source/graph-analysis/types/CloneableGraphIfc.js";

import type {
  PrivateFieldTupleIds
} from "../../source/graph-analysis/types/ObjectGraphIfc.js";

import type {
  SearchReferencesIfc,
} from "../../source/graph-analysis/types/SearchReferencesIfc.js";

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
  let objectGraph: HostObjectGraph<
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

      objectGraph.definePropertyOrGetter(heldValues, 0, firstValue, new RelationshipMetadata, false);
      const heldToTarget = objectGraph.definePropertyOrGetter(heldValues, 1, target, targetEdgeMetadata, false);
      objectGraph.definePropertyOrGetter(heldValues, 2, lastValue, new RelationshipMetadata, false);

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
        label: "1",
        edgeType: EdgePrefix.PropertyKey,
        description: createValueDescription(1, objectGraph),
        metadata: targetEdgeMetadata,
        isStrongReference: true,
      });
    });

    it("object properties with string keys", () => {
      const middleValue = { target };
      heldValues.push(middleValue);

      objectGraph.defineObject(middleValue, new ObjectMetadata);

      const heldToMiddle = new RelationshipMetadata("held values to middle value");
      objectGraph.definePropertyOrGetter(heldValues, 0, middleValue, heldToMiddle, false);

      const middleToTargetMeta = new RelationshipMetadata("middle value to target");
      const middleToTarget = objectGraph.definePropertyOrGetter(middleValue, "target", target, middleToTargetMeta, false);

      expect(objectGraph.getEdgeRelationship(middleToTarget)).toEqual({
        label: "target",
        edgeType: EdgePrefix.PropertyKey,
        description: createValueDescription("target", objectGraph),
        metadata: middleToTargetMeta,
        isStrongReference: true,
      });
    });

    it("object properties with symbol keys", () => {
      const symbolKey = Symbol("key");
      objectGraph.defineSymbol(symbolKey, new ObjectMetadata);

      const middleValue = { [symbolKey]: target };
      heldValues.push(middleValue);

      objectGraph.defineObject(middleValue, new ObjectMetadata);

      const heldToMiddle = new RelationshipMetadata("held values to middle value");
      objectGraph.definePropertyOrGetter(heldValues, 0, middleValue, heldToMiddle, false);

      const middleToTargetMeta = new RelationshipMetadata("middle value to target");
      objectGraph.defineAsSymbolKey(middleValue, symbolKey, new RelationshipMetadata("symbol key of middle value"));
      const middleToTarget = objectGraph.definePropertyOrGetter(middleValue, symbolKey, target, middleToTargetMeta, false);

      expect(objectGraph.getEdgeRelationship(middleToTarget)).toEqual({
        label: "key",
        edgeType: EdgePrefix.PropertyKey,
        description: createValueDescription(symbolKey, objectGraph),
        metadata: middleToTargetMeta,
        isStrongReference: true,
      });
    });

    it("objects referring to the target as a symbol key", () => {
      const target = Symbol("is target");
      heldValues = [];

      {
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
      }

      const tailValue = { isTail: "true" };

      const middleValue = { [target]: tailValue };
      heldValues.push(middleValue);

      const heldToMiddle = new RelationshipMetadata("held values to middle value");
      objectGraph.defineObject(middleValue, new ObjectMetadata);
      objectGraph.definePropertyOrGetter(heldValues, 0, middleValue, heldToMiddle, false);

      const middleToTargetMeta = new RelationshipMetadata("middle value to target as key");
      const middleToTargetId = objectGraph.defineAsSymbolKey(middleValue, target, middleToTargetMeta);
      objectGraph.defineObject(tailValue, new ObjectMetadata);
      objectGraph.definePropertyOrGetter(
        middleValue, target, tailValue, new RelationshipMetadata("middle value to tail"), false
      );

      expect(objectGraph.getEdgeRelationship(middleToTargetId)).toEqual({
        label: "is target",
        edgeType: EdgePrefix.HasSymbolAsKey,
        description: {
          valueType: ValueDiscrimant.NotApplicable
        },
        metadata: middleToTargetMeta,
        isStrongReference: true,
      });
    });

    it("values in a function's scope", () => {
      const middleValue = function() {};
      heldValues.push(middleValue);
      objectGraph.defineObject(middleValue, new ObjectMetadata);

      const heldToMiddle = new RelationshipMetadata("held values to middle value");
      objectGraph.definePropertyOrGetter(
        heldValues, 0, middleValue, heldToMiddle, false
      );

      const middleToTargetMeta = new RelationshipMetadata("middle value to target");
      const middleToTargetId = objectGraph.defineScopeValue(
        middleValue, "this", target, middleToTargetMeta
      );

      expect(objectGraph.getEdgeRelationship(middleToTargetId)).toEqual({
        label: `(scope:this)`,
        edgeType: EdgePrefix.ScopeValue,
        description: createValueDescription("this", objectGraph),
        metadata: middleToTargetMeta,
        isStrongReference: true,
      });
    });

    it("objects with internal slots", () => {
      const middleValue = {};
      heldValues.push(middleValue);

      objectGraph.defineObject(middleValue, new ObjectMetadata);

      const heldToMiddle = new RelationshipMetadata("held values to middle value");
      objectGraph.definePropertyOrGetter(
        heldValues, 0, middleValue, heldToMiddle, false
      );

      const middleToTargetMeta = new RelationshipMetadata("middle value to target");
      const middleToTarget = objectGraph.defineInternalSlot(
        middleValue, "[[WeakRefTarget]]", target, false, middleToTargetMeta
      );

      expect(objectGraph.getEdgeRelationship(middleToTarget)).toEqual({
        label: "[[WeakRefTarget]]",
        edgeType: EdgePrefix.InternalSlot,
        description: createValueDescription("[[WeakRefTarget]]", objectGraph),
        metadata: middleToTargetMeta,
        isStrongReference: false
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
  
        objectGraph.definePropertyOrGetter(heldValues, 0, map, heldToMap, false);
      });

      it("object keys and object values", () => {
        objectGraph.defineObject(key, new ObjectMetadata("key"));
        objectGraph.defineObject(value, new ObjectMetadata("value"));

        const {
          tupleNodeId,
          mapToKeyEdgeId,
          mapToTupleEdgeId,
          keyToTupleEdgeId,
          tupleToValueEdgeId
        } = objectGraph.defineMapKeyValueTuple(
          map, key, value, false, keyMetadata, valueMetadata
        );

        expect(objectGraph.getEdgeRelationship(mapToTupleEdgeId)).toEqual({
          label: "(map tuple)",
          edgeType: EdgePrefix.MapToTuple,
          description: {
            valueType: ValueDiscrimant.NotApplicable
          },
          metadata: null,
          isStrongReference: true,
        });

        expect(mapToKeyEdgeId).toBeDefined();
        if (mapToKeyEdgeId) {
          expect(objectGraph.getEdgeRelationship(mapToKeyEdgeId)).toEqual({
            label: "(map key)",
            edgeType: EdgePrefix.MapKey,
            description: createValueDescription(key, objectGraph),
            metadata: keyMetadata,
            isStrongReference: false,
          });
        }

        expect(keyToTupleEdgeId).toBeDefined();
        if (keyToTupleEdgeId) {
          expect(objectGraph.getEdgeRelationship(keyToTupleEdgeId)).toEqual({
            label: "(map key to tuple)",
            edgeType: EdgePrefix.MapKeyToTuple,
            description: {
              valueType: ValueDiscrimant.NotApplicable
            },
            metadata: null,
            isStrongReference: true,
          });
        }

        expect(tupleToValueEdgeId).toBeDefined();
        if (tupleToValueEdgeId) {
          expect(objectGraph.getEdgeRelationship(tupleToValueEdgeId)).toEqual({
            label: "(map value)",
            edgeType: EdgePrefix.MapValue,
            description: createValueDescription(value, objectGraph),
            metadata: valueMetadata,
            isStrongReference: true,
          });
        }

        const rawGraph = cloneableGraph.cloneGraph();
        const inEdges = rawGraph.inEdges(tupleNodeId);
        expect(inEdges).toBeDefined();
        if (inEdges) {
          expect(inEdges.length).toBe(2);
          expect(inEdges[0]?.name).toBe(mapToTupleEdgeId);
          expect(inEdges[1]?.name).toBe(keyToTupleEdgeId);
        }

        const outEdges = rawGraph.outEdges(tupleNodeId);
        expect(outEdges).toBeDefined();
        if (outEdges) {
          expect(outEdges.length).toBe(1);
          expect(outEdges[0]?.name).toBe(tupleToValueEdgeId);
        }
      });

      it("primitive keys and object values", () => {
        objectGraph.defineObject(value, new ObjectMetadata("value"));

        const {
          tupleNodeId,
          mapToKeyEdgeId,
          mapToTupleEdgeId,
          keyToTupleEdgeId,
          tupleToValueEdgeId
        } = objectGraph.defineMapKeyValueTuple(
          map, "key", value, true, undefined, valueMetadata
        );

        expect(objectGraph.getEdgeRelationship(mapToTupleEdgeId)).toEqual({
          label: "(map tuple)",
          edgeType: EdgePrefix.MapToTuple,
          description: {
            valueType: ValueDiscrimant.NotApplicable
          },
          metadata: null,
          isStrongReference: true,
        });

        expect(mapToKeyEdgeId).toBeUndefined();
        expect(keyToTupleEdgeId).toBeUndefined();

        expect(tupleToValueEdgeId).toBeDefined();
        if (tupleToValueEdgeId) {
          expect(objectGraph.getEdgeRelationship(tupleToValueEdgeId)).toEqual({
            label: "(map value)",
            edgeType: EdgePrefix.MapValue,
            description: createValueDescription(value, objectGraph),
            metadata: valueMetadata,
            isStrongReference: true,
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
          mapToKeyEdgeId,
          mapToTupleEdgeId,
          keyToTupleEdgeId,
          tupleToValueEdgeId
        } = objectGraph.defineMapKeyValueTuple(
          map, key, "value", false, keyMetadata, undefined
        );

        expect(objectGraph.getEdgeRelationship(mapToTupleEdgeId)).toEqual({
          label: "(map tuple)",
          edgeType: EdgePrefix.MapToTuple,
          description: {
            valueType: ValueDiscrimant.NotApplicable
          },
          metadata: null,
          isStrongReference: true,
        });

        expect(mapToKeyEdgeId).toBeDefined();
        if (mapToKeyEdgeId) {
          expect(objectGraph.getEdgeRelationship(mapToKeyEdgeId)).toEqual({
            label: "(map key)",
            edgeType: EdgePrefix.MapKey,
            description: createValueDescription(key, objectGraph),
            metadata: keyMetadata,
            isStrongReference: false,
          });
        }

        expect(keyToTupleEdgeId).toBeDefined();
        if (keyToTupleEdgeId) {
          expect(objectGraph.getEdgeRelationship(keyToTupleEdgeId)).toEqual({
            label: "(map key to tuple)",
            edgeType: EdgePrefix.MapKeyToTuple,
            description: {
              valueType: ValueDiscrimant.NotApplicable
            },
            metadata: null,
            isStrongReference: true,
          });
        }

        expect(tupleToValueEdgeId).toBeUndefined();

        const rawGraph = cloneableGraph.cloneGraph();
        const inEdges = rawGraph.inEdges(tupleNodeId);
        expect(inEdges).toBeDefined();
        if (inEdges) {
          expect(inEdges.length).toBe(2);
          expect(inEdges[0]?.name).toBe(mapToTupleEdgeId);
          expect(inEdges[1]?.name).toBe(keyToTupleEdgeId);
        }

        const outEdges = rawGraph.outEdges(tupleNodeId);
        expect(outEdges).toBeDefined();
        if (outEdges) {
          expect(outEdges.length).toBe(0);
        }
      });
    });

    it("sets with values", () => {
      const middleValue = {};
      heldValues.push(middleValue);

      objectGraph.defineObject(middleValue, new ObjectMetadata);

      const heldToMiddle = new RelationshipMetadata("held values to middle value");
      objectGraph.definePropertyOrGetter(heldValues, 0, middleValue, heldToMiddle, false);

      const middleToTargetMeta = new RelationshipMetadata("middle value to target");
      const middleToTarget = objectGraph.defineSetValue(middleValue, target, true, middleToTargetMeta);

      expect(objectGraph.getEdgeRelationship(middleToTarget)).toEqual({
        label: "(element)",
        edgeType: EdgePrefix.SetValue,
        description: {
          valueType: ValueDiscrimant.NotApplicable,
        },
        metadata: middleToTargetMeta,
        isStrongReference: true,
      });
    });

    describe("finalization registry entries", () => {
      const registry = {isFinalizationRegistry: true};
      const regMetadata = new ObjectMetadata("finalization registry");
      const registryHeld = {registryHeld: true };
      const heldMetadata = new ObjectMetadata("held value metadata");
      const token = { isUnregisterToken: true };
      const tokenMetadata = new ObjectMetadata("unregister token");
      beforeEach(() => {
        objectGraph.defineObject(registry, regMetadata);
      });

      it("including the target, held value (object) and unregister token", () => {
        objectGraph.defineObject(registryHeld, heldMetadata);
        objectGraph.defineObject(token, tokenMetadata);

        const {
          tupleNodeId,
          registryToTargetEdgeId,
          registryToTupleEdgeId,
          registryTargetToTupleEdgeId,
          tupleToHeldValueEdgeId,
          tupleToUnregisterTokenEdgeId,
        } = objectGraph.defineFinalizationTuple(registry, target, registryHeld, token);

        expect(
          objectGraph.getEdgeRelationship(registryToTargetEdgeId)
        ).withContext("registry to target").toEqual({
          label: "(registry to target)",
          edgeType: EdgePrefix.FinalizationRegistryToTarget,
          description: createValueDescription(target, objectGraph),
          metadata: null,
          isStrongReference: false,
        });

        expect(
          objectGraph.getEdgeRelationship(registryToTupleEdgeId)
        ).withContext("registry to tuple").toEqual({
          label: "(registry to tuple)",
          edgeType: EdgePrefix.FinalizationRegistryToTuple,
          description: {
            valueType: ValueDiscrimant.NotApplicable
          },
          metadata: null,
          isStrongReference: true,
        });

        expect(
          objectGraph.getEdgeRelationship(registryTargetToTupleEdgeId)
        ).withContext("target to tuple").toEqual({
          label: "(registry target to tuple)",
          edgeType: EdgePrefix.FinalizationTargetToTuple,
          description: {
            valueType: ValueDiscrimant.NotApplicable
          },
          metadata: null,
          isStrongReference: true,
        });

        expect(tupleToHeldValueEdgeId).withContext("held value defined").toBeDefined();
        if (tupleToHeldValueEdgeId) {
          expect(
            objectGraph.getEdgeRelationship(tupleToHeldValueEdgeId)
          ).withContext("held value").toEqual({
            label: "(held value)",
            edgeType: EdgePrefix.FinalizationTupleToHeldValue,
            description: createValueDescription(registryHeld, objectGraph),
            metadata: null,
            isStrongReference: true,
          });
        }

        expect(tupleToUnregisterTokenEdgeId).withContext("tuple to unregister token").toBeDefined();
        if (tupleToUnregisterTokenEdgeId) {
          expect(objectGraph.getEdgeRelationship(tupleToUnregisterTokenEdgeId)).toEqual({
            label: "(unregister token)",
            edgeType: EdgePrefix.FinalizationTupleToUnregisterToken,
            description: createValueDescription(token, objectGraph),
            metadata: null,
            isStrongReference: false,
          });
        }

        const rawGraph = cloneableGraph.cloneGraph();
        const inEdges = rawGraph.inEdges(tupleNodeId);
        expect(inEdges).toBeDefined();
        if (inEdges) {
          expect(inEdges.length).withContext("inEdges").toBe(2);
          expect(inEdges[0]?.name).withContext("inEdges[0]").toBe(registryToTupleEdgeId);
          expect(inEdges[1]?.name).withContext("inEdges[1]").toBe(registryTargetToTupleEdgeId);
        }

        const outEdges = rawGraph.outEdges(tupleNodeId);
        expect(outEdges).toBeDefined();
        if (outEdges) {
          expect(outEdges.length).withContext("outEdges").toBe(2);
          expect(outEdges[0]?.name).withContext("outEdges[0]").toBe(tupleToHeldValueEdgeId);
          expect(outEdges[1]?.name).withContext("outEdges[1]").toBe(tupleToUnregisterTokenEdgeId);
        }
      });

      it("including the target and held value (object)", () => {
        objectGraph.defineObject(registryHeld, heldMetadata);

        const {
          tupleNodeId,
          registryToTargetEdgeId,
          registryToTupleEdgeId,
          registryTargetToTupleEdgeId,
          tupleToHeldValueEdgeId,
          tupleToUnregisterTokenEdgeId,
        } = objectGraph.defineFinalizationTuple(registry, target, registryHeld, undefined);

        expect(
          objectGraph.getEdgeRelationship(registryToTargetEdgeId)
        ).withContext("registry to target").toEqual({
          label: "(registry to target)",
          edgeType: EdgePrefix.FinalizationRegistryToTarget,
          description: createValueDescription(target, objectGraph),
          metadata: null,
          isStrongReference: false,
        });

        expect(
          objectGraph.getEdgeRelationship(registryToTupleEdgeId)
        ).withContext("registry to tuple").toEqual({
          label: "(registry to tuple)",
          edgeType: EdgePrefix.FinalizationRegistryToTuple,
          description: {
            valueType: ValueDiscrimant.NotApplicable
          },
          metadata: null,
          isStrongReference: true,
        });

        expect(
          objectGraph.getEdgeRelationship(registryTargetToTupleEdgeId)
        ).withContext("registry target to tuple").toEqual({
          label: "(registry target to tuple)",
          edgeType: EdgePrefix.FinalizationTargetToTuple,
          description: {
            valueType: ValueDiscrimant.NotApplicable,
          },
          metadata: null,
          isStrongReference: true,
        });

        expect(tupleToHeldValueEdgeId).toBeDefined();
        if (tupleToHeldValueEdgeId) {
          expect(
            objectGraph.getEdgeRelationship(tupleToHeldValueEdgeId)
          ).withContext("tuple to held value").toEqual({
            label: "(held value)",
            edgeType: EdgePrefix.FinalizationTupleToHeldValue,
            description: createValueDescription(registryHeld, objectGraph),
            metadata: null,
            isStrongReference: true,
          });
        }

        expect(tupleToUnregisterTokenEdgeId).toBeUndefined();

        const rawGraph = cloneableGraph.cloneGraph();
        const inEdges = rawGraph.inEdges(tupleNodeId);
        expect(inEdges).withContext("inEdges defined").toBeDefined();
        if (inEdges) {
          expect(inEdges.length).withContext("inEdges").toBe(2);
          expect(inEdges[0]?.name).withContext("inEdges[0]").toBe(registryToTupleEdgeId);
          expect(inEdges[1]?.name).withContext("inEdges[1]").toBe(registryTargetToTupleEdgeId);
        }

        const outEdges = rawGraph.outEdges(tupleNodeId);
        expect(outEdges).withContext("outEdges defined").toBeDefined();
        if (outEdges) {
          expect(outEdges.length).withContext("outEdges").toBe(1);
          expect(outEdges[0]?.name).withContext("outEdges[0]").toBe(tupleToHeldValueEdgeId);
        }
      });

      it("including the target and held value (primitive)", () => {
        const {
          tupleNodeId,
          registryToTargetEdgeId,
          registryToTupleEdgeId,
          registryTargetToTupleEdgeId,
          tupleToHeldValueEdgeId,
          tupleToUnregisterTokenEdgeId,
        } = objectGraph.defineFinalizationTuple(registry, target, "hello", undefined);

        expect(
          objectGraph.getEdgeRelationship(registryToTargetEdgeId)
        ).withContext("registry to target").toEqual({
          label: "(registry to target)",
          edgeType: EdgePrefix.FinalizationRegistryToTarget,
          description: createValueDescription(target, objectGraph),
          metadata: null,
          isStrongReference: false,
        });

        expect(
          objectGraph.getEdgeRelationship(registryToTupleEdgeId)
        ).withContext("registry to tuple").toEqual({
          label: "(registry to tuple)",
          edgeType: EdgePrefix.FinalizationRegistryToTuple,
          description: {
            valueType: ValueDiscrimant.NotApplicable
          },
          metadata: null,
          isStrongReference: true,
        });

        expect(tupleToHeldValueEdgeId).withContext("tuple to held value").toBeUndefined();
        expect(tupleToUnregisterTokenEdgeId).withContext("tuple to unregister token").toBeUndefined();

        const rawGraph = cloneableGraph.cloneGraph();
        const inEdges = rawGraph.inEdges(tupleNodeId);
        expect(inEdges).withContext("inEdges defined").toBeDefined();
        if (inEdges) {
          expect(inEdges.length).withContext("inEdges.length").toBe(2);
          expect(inEdges[0]?.name).withContext("inEdges[0]").toBe(registryToTupleEdgeId);
          expect(inEdges[1]?.name).withContext("inEdges[1]").toBe(registryTargetToTupleEdgeId);
        }

        const outEdges = rawGraph.outEdges(tupleNodeId);
        expect(outEdges).withContext("outEdges defined").toBeDefined();
        expect(outEdges?.length).withContext("outEdges.length").toBe(0);
      });

      it("including the target, which is also the unregister token", () => {
        objectGraph.defineObject(registryHeld, heldMetadata);

        const {
          tupleNodeId,
          registryToTargetEdgeId,
          registryToTupleEdgeId,
          registryTargetToTupleEdgeId,
          tupleToHeldValueEdgeId,
          tupleToUnregisterTokenEdgeId,
        } = objectGraph.defineFinalizationTuple(registry, target, registryHeld, target);

        expect(
          objectGraph.getEdgeRelationship(registryToTargetEdgeId)
        ).withContext("registry to target").toEqual({
          label: "(registry to target)",
          edgeType: EdgePrefix.FinalizationRegistryToTarget,
          description: createValueDescription(target, objectGraph),
          metadata: null,
          isStrongReference: false,
        });

        expect(
          objectGraph.getEdgeRelationship(registryToTupleEdgeId)
        ).withContext("registry to tuple").toEqual({
          label: "(registry to tuple)",
          edgeType: EdgePrefix.FinalizationRegistryToTuple,
          description: {
            valueType: ValueDiscrimant.NotApplicable
          },
          metadata: null,
          isStrongReference: true,
        });

        expect(
          objectGraph.getEdgeRelationship(registryTargetToTupleEdgeId)
        ).withContext("registry target to tuple").toEqual({
          label: "(registry target to tuple)",
          edgeType: EdgePrefix.FinalizationTargetToTuple,
          description: {
            valueType: ValueDiscrimant.NotApplicable
          },
          metadata: null,
          isStrongReference: true,
        });

        expect(tupleToHeldValueEdgeId).withContext("tuple to held value defined").toBeDefined();
        if (tupleToHeldValueEdgeId) {
          expect(
            objectGraph.getEdgeRelationship(tupleToHeldValueEdgeId)
          ).withContext("held value").toEqual({
            label: "(held value)",
            edgeType: EdgePrefix.FinalizationTupleToHeldValue,
            description: createValueDescription(registryHeld, objectGraph),
            metadata: null,
            isStrongReference: true,
          });
        }

        expect(tupleToUnregisterTokenEdgeId).toBeUndefined();

        const rawGraph = cloneableGraph.cloneGraph();
        const inEdges = rawGraph.inEdges(tupleNodeId);
        expect(inEdges).withContext("inEdges defined").toBeDefined();
        if (inEdges) {
          expect(inEdges.length).withContext("inEdges.length").toBe(2);
          expect(inEdges[0]?.name).withContext("inEdges[0]").toBe(registryToTupleEdgeId);
          expect(inEdges[1]?.name).withContext("inEdges[1]").toBe(registryTargetToTupleEdgeId);
        }

        const outEdges = rawGraph.outEdges(tupleNodeId);
        expect(outEdges).withContext("outEdges defined").toBeDefined();
        if (outEdges) {
          expect(outEdges.length).withContext("outEdges.length").toBe(1);
          expect(outEdges[0]?.name).withContext("outEdges[0]").toBe(tupleToHeldValueEdgeId);
        }
      });
    });

    it("multiple references to a value", () => {
      heldValues.push(target, target);

      const firstIndexMetadata = new RelationshipMetadata("first index");
      const secondIndexMetadata = new RelationshipMetadata("second index");
      const firstEdge = objectGraph.definePropertyOrGetter(
        heldValues, 0, target, firstIndexMetadata, false
      );
      const secondEdge = objectGraph.definePropertyOrGetter(
        heldValues, 1, target, secondIndexMetadata, false
      );

      expect(objectGraph.getEdgeRelationship(firstEdge)).toEqual({
        label: "0",
        edgeType: EdgePrefix.PropertyKey,
        description: createValueDescription(0, objectGraph),
        metadata: firstIndexMetadata,
        isStrongReference: true,
      });

      expect(objectGraph.getEdgeRelationship(secondEdge)).toEqual({
        label: "1",
        edgeType: EdgePrefix.PropertyKey,
        description: createValueDescription(1, objectGraph),
        metadata: secondIndexMetadata,
        isStrongReference: true,
      });
    });

    it("private class fields", () => {
      const privateKey = { isPrivateKey: true };
      const owner = { isOwner: true };

      heldValues.push(owner);
      objectGraph.defineObject(owner, new ObjectMetadata("owner"));
      objectGraph.definePropertyOrGetter(heldValues, 0, owner, new RelationshipMetadata(), false);

      objectGraph.definePrivateName(privateKey, "#privateKey");
      const privateNameRelationship = new RelationshipMetadata("owner to private name");
      const targetRelationship = new RelationshipMetadata("owner to target");
      const {
        tupleNodeId,
        objectToPrivateKeyEdgeId,
        objectToTupleEdgeId,
        privateKeyToTupleEdgeId,
        tupleToValueEdgeId
      }: PrivateFieldTupleIds = objectGraph.definePrivateField(
        owner, privateKey, "#privateKey", target,
        privateNameRelationship, targetRelationship, false
      );

      expect(objectGraph.getEdgeRelationship(objectToPrivateKeyEdgeId)).withContext("object to private key").toEqual({
        label: "(private key)",
        edgeType: EdgePrefix.ObjectToPrivateKey,
        description: {
          valueType: ValueDiscrimant.NotApplicable,
        },
        metadata: privateNameRelationship,
        isStrongReference: true,
      })

      expect(objectGraph.getEdgeRelationship(objectToTupleEdgeId)).withContext("object to tuple").toEqual({
        label: "(object to private tuple)",
        edgeType: EdgePrefix.ObjectToPrivateTuple,
        description: {
          valueType: ValueDiscrimant.NotApplicable
        },
        metadata: null,
        isStrongReference: true,
      });

      expect(objectGraph.getEdgeRelationship(privateKeyToTupleEdgeId)).withContext("private key to tuple").toEqual({
        label: "(private key to tuple)",
        edgeType: EdgePrefix.PrivateKeyToTuple,
        description: {
          valueType: ValueDiscrimant.NotApplicable,
        },
        metadata: null,
        isStrongReference: true,
      });

      expect(objectGraph.getEdgeRelationship(tupleToValueEdgeId)).withContext("#privateKey").toEqual({
        label: "#privateKey",
        edgeType: EdgePrefix.PrivateTupleToValue,
        description: createValueDescription("#privateKey", objectGraph),
        metadata: targetRelationship,
        isStrongReference: true,
      });

      const rawGraph = cloneableGraph.cloneGraph();
      const inEdges = rawGraph.inEdges(tupleNodeId);
      expect(inEdges).toBeDefined();
      if (inEdges) {
        expect(inEdges.length).toBe(2);
        expect(inEdges[0]?.name).toBe(objectToTupleEdgeId);
        expect(inEdges[1]?.name).toBe(privateKeyToTupleEdgeId);
      }

      const outEdges = rawGraph.outEdges(tupleNodeId);
      expect(outEdges).toBeDefined();
      if (outEdges) {
        expect(outEdges.length).toBe(1);
        expect(outEdges[0]?.name).toBe(tupleToValueEdgeId);
      }
    });

    it("private class getters", () => {
      const privateKey = { isPrivateKey: true };
      const owner = { isOwner: true };

      heldValues.push(owner);
      objectGraph.defineObject(owner, new ObjectMetadata("owner"));
      objectGraph.definePropertyOrGetter(heldValues, 0, owner, new RelationshipMetadata(), false);

      objectGraph.definePrivateName(privateKey, "#privateKey");
      const privateNameRelationship = new RelationshipMetadata("owner to private name");
      const targetRelationship = new RelationshipMetadata("owner to target");
      const {
        tupleNodeId,
        objectToPrivateKeyEdgeId,
        objectToTupleEdgeId,
        privateKeyToTupleEdgeId,
        tupleToValueEdgeId
      } = objectGraph.definePrivateField(
        owner, privateKey, "#privateKey", target,
        privateNameRelationship, targetRelationship, true
      );

      expect(objectGraph.getEdgeRelationship(objectToPrivateKeyEdgeId)).withContext("private key").toEqual({
        label: "(private key)",
        edgeType: EdgePrefix.ObjectToPrivateKey,
        description: {
          valueType: ValueDiscrimant.NotApplicable,
        },
        metadata: privateNameRelationship,
        isStrongReference: true,
      });

      expect(objectGraph.getEdgeRelationship(objectToTupleEdgeId)).withContext("object to private tuple").toEqual({
        label: "(object to private tuple)",
        edgeType: EdgePrefix.ObjectToPrivateTuple,
        description: {
          valueType: ValueDiscrimant.NotApplicable
        },
        metadata: null,
        isStrongReference: true,
      });

      expect(objectGraph.getEdgeRelationship(privateKeyToTupleEdgeId)).withContext("private key to tuple").toEqual({
        label: "(private key to tuple)",
        edgeType: EdgePrefix.PrivateKeyToTuple,
        description: {
          valueType: ValueDiscrimant.NotApplicable,
        },
        metadata: null,
        isStrongReference: true,
      });

      // the edge type is the significant difference from the private value test
      expect(objectGraph.getEdgeRelationship(tupleToValueEdgeId)).withContext("tuple to value").toEqual({
        label: "#privateKey",
        edgeType: EdgePrefix.PrivateTupleToGetter,
        description: createValueDescription("#privateKey", objectGraph),
        metadata: targetRelationship,
        isStrongReference: true,
      });

      const rawGraph = cloneableGraph.cloneGraph();
      const inEdges = rawGraph.inEdges(tupleNodeId);
      expect(inEdges).toBeDefined();
      if (inEdges) {
        expect(inEdges.length).toBe(2);
        expect(inEdges[0]?.name).toBe(objectToTupleEdgeId);
        expect(inEdges[1]?.name).toBe(privateKeyToTupleEdgeId);
      }

      const outEdges = rawGraph.outEdges(tupleNodeId);
      expect(outEdges).toBeDefined();
      if (outEdges) {
        expect(outEdges.length).toBe(1);
        expect(outEdges[0]?.name).toBe(tupleToValueEdgeId);
      }
    });
  });

  describe("marks references to target objects as", () => {
    it("strong in a regular map", () => {
      const map = {}, key = {}, value = {};
      heldValues.push(map);
      objectGraph.defineObject(map, new ObjectMetadata("map"));

      const heldToMap = new RelationshipMetadata("held values to map");
      objectGraph.definePropertyOrGetter(heldValues, 0, map, heldToMap, false);

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
      objectGraph.definePropertyOrGetter(heldValues, 0, map, heldToMap, false);

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
      objectGraph.definePropertyOrGetter(heldValues, 0, map, heldToMap, false);
      objectGraph.definePropertyOrGetter(
        heldValues, 1, key, new RelationshipMetadata("held values to key"), false
      );

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
      objectGraph.definePropertyOrGetter(
        heldValues, 0, A, new RelationshipMetadata, false
      );
  
      objectGraph.defineObject(B, new ObjectMetadata);
      objectGraph.definePropertyOrGetter(
        heldValues, 1, B, new RelationshipMetadata, false
      );

      objectGraph.defineObject(E, new ObjectMetadata);
      objectGraph.definePropertyOrGetter(
        heldValues, 2, E, new RelationshipMetadata, false
      );
  
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
      objectGraph.definePropertyOrGetter(
        heldValues, 0, A, new RelationshipMetadata, false
      );

      objectGraph.defineObject(B, new ObjectMetadata);
      objectGraph.definePropertyOrGetter(
        heldValues, 1, B, new RelationshipMetadata, false
      );
  
      objectGraph.defineObject(E, new ObjectMetadata);
      objectGraph.definePropertyOrGetter(
        heldValues, 2, E, new RelationshipMetadata, false
      );
  
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
    it("strong when the target is an object key", () => {
      const target = Symbol("target");
      {
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
      }

      const value = { name: "value" };
      const propertyBag = { name: "propertyBag", [target]: value };
      objectGraph.defineObject(propertyBag, new ObjectMetadata("propertyBag"));

      heldValues.push(propertyBag);
      objectGraph.definePropertyOrGetter(
        heldValues, 0, propertyBag, new RelationshipMetadata("held values to property bag"), false
      );

      objectGraph.defineAsSymbolKey(propertyBag, target, new RelationshipMetadata("property bag to target"));
      objectGraph.defineObject(value, new ObjectMetadata("value"));
      objectGraph.definePropertyOrGetter(
        propertyBag, target, value, new RelationshipMetadata("property bag to value via target"), false
      );

      searchReferences.markStrongReferencesFromHeldValues();
      expect(searchReferences.isKeyHeldStrongly(propertyBag)).withContext("propertyBag").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(target)).withContext("target").toBeTrue();
      expect(searchReferences.isKeyHeldStrongly(value)).withContext("value").toBeTrue();
    });

    it("strong in a regular map", () => {
      const map = {}, key = Symbol("key"), value = Symbol("value");
      heldValues.push(map);
      objectGraph.defineObject(map, new ObjectMetadata("map"));

      const heldToMap = new RelationshipMetadata("held values to map");
      objectGraph.definePropertyOrGetter(heldValues, 0, map, heldToMap, false);

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
      objectGraph.definePropertyOrGetter(heldValues, 0, map, heldToMap, false);

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
      objectGraph.definePropertyOrGetter(heldValues, 0, map, heldToMap, false);
      objectGraph.definePropertyOrGetter(
        heldValues, 1, key, new RelationshipMetadata("held values to key"), false
      );

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

      objectGraph.definePropertyOrGetter(heldValues, 0, map, heldToMap, false);

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
        mapToKeyEdgeId,
        mapToTupleEdgeId,
        keyToTupleEdgeId,
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
      )).withContext("map => tuple").toBeTrue();

      expect(graph.hasEdge(
        objectGraph.getWeakKeyId(map),
        objectGraph.getWeakKeyId(targetKey),
        mapToKeyEdgeId
      )).withContext("map => key").toBeTrue();

      expect(graph.hasEdge(
        objectGraph.getWeakKeyId(targetKey),
        tupleNodeId,
        keyToTupleEdgeId
      )).withContext("key => tuple").toBeTrue();

      expect(graph.hasEdge(
        tupleNodeId,
        objectGraph.getWeakKeyId(target),
        tupleToValueEdgeId
      )).withContext("tuple => value").toBeTrue();

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
        mapToKeyEdgeId,
        mapToTupleEdgeId,
        keyToTupleEdgeId,
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
        objectGraph.getWeakKeyId(targetKey),
        mapToKeyEdgeId
      )).withContext("map => key");

      expect(graph.hasEdge(
        objectGraph.getWeakKeyId(map),
        tupleNodeId,
        mapToTupleEdgeId
      )).withContext("map => tuple").toBeTrue();

      expect(graph.hasEdge(
        objectGraph.getWeakKeyId(targetKey),
        tupleNodeId,
        keyToTupleEdgeId
      )).withContext("key => tuple").toBeTrue();

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

    it("(true) removes nodes unreachable from the held values", () => {
      const { tupleNodeId } = objectGraph.defineMapKeyValueTuple(
        map, key, target, false, keyMetadata, valueMetadata
      );

      objectGraph.definePropertyOrGetter(heldValues, 1, target, new RelationshipMetadata("held values direct to target"), false);

      searchReferences.markStrongReferencesFromHeldValues();
      searchReferences.summarizeGraphToTarget(true);
      const graph: Graph = cloneableGraph.cloneGraph();
      expect(graph.hasNode("target:0")).toBeTrue();
      expect(graph.hasNode(tupleNodeId)).toBeFalse();
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
        () => objectGraph.definePropertyOrGetter(
          unused, "foo", target, valueMetadata, false
        )
      ).toThrowError("parentObject is not defined as a node");

      expect(
        () => objectGraph.definePropertyOrGetter(
          heldValues, "foo", unused, valueMetadata, false
        )
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
      ).toThrowError("object is already defined as a node in this graph, with id target:0");
    });

    it("defining a non-object as a weak map key", () => {
      expect(
        () => objectGraph.defineMapKeyValueTuple(heldValues, 2, target, false, keyMetadata, valueMetadata)
      ).toThrowError("key must be a WeakKey");
    });
  });
});
