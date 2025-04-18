import * as GuestEngine from '@engine262/engine262';
import graphlib from '@dagrejs/graphlib';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve } from 'import-meta-resolve';

function* EnsureTypeOrThrow(guestEvaluator) {
    const guestType = yield* guestEvaluator;
    if (guestType instanceof GuestEngine.ThrowCompletion)
        throw guestType;
    if (guestType instanceof GuestEngine.NormalCompletion)
        return guestType.Value;
    return guestType;
}

function* convertArrayValueToArrayOfValues(arrayValue) {
    if (arrayValue.type !== "Object") {
        throw GuestEngine.Throw('TypeError', "Raw", "Expected an Array object");
    }
    if (!GuestEngine.isArrayExoticObject(arrayValue)) {
        throw GuestEngine.Throw('TypeError', "Raw", "Expected an Array exotic object");
    }
    return yield* GuestEngine.CreateListFromArrayLike(arrayValue, undefined);
}

class StringCounter {
    #counter = 0;
    next(prefix) {
        return `${prefix}:${this.#counter++}`;
    }
}

// used in describing values
var ValueDiscrimant;
(function (ValueDiscrimant) {
    ValueDiscrimant["NotApplicable"] = "NotApplicable";
    ValueDiscrimant["Object"] = "Object";
    ValueDiscrimant["Symbol"] = "Symbol";
    ValueDiscrimant["BigInt"] = "BigInt";
    ValueDiscrimant["Primitive"] = "Primitive";
})(ValueDiscrimant || (ValueDiscrimant = {}));
//#region nodes
var BuiltInJSTypeName;
(function (BuiltInJSTypeName) {
    BuiltInJSTypeName["Symbol"] = "Symbol";
    BuiltInJSTypeName["Object"] = "Object";
    BuiltInJSTypeName["Array"] = "Array";
    BuiltInJSTypeName["Function"] = "Function";
    BuiltInJSTypeName["AsyncFunction"] = "AsyncFunction";
    BuiltInJSTypeName["WeakRef"] = "WeakRef";
    BuiltInJSTypeName["WeakMap"] = "WeakMap";
    BuiltInJSTypeName["WeakSet"] = "WeakSet";
    BuiltInJSTypeName["Map"] = "Map";
    BuiltInJSTypeName["Set"] = "Set";
    BuiltInJSTypeName["Promise"] = "Promise";
    BuiltInJSTypeName["Proxy"] = "Proxy";
    BuiltInJSTypeName["FinalizationRegistry"] = "FinalizationRegistry";
    BuiltInJSTypeName["PrivateName"] = "#private";
    BuiltInJSTypeName["ArrayIterator"] = "ArrayIterator";
    BuiltInJSTypeName["MapIterator"] = "MapIterator";
    BuiltInJSTypeName["SetIterator"] = "SetIterator";
    BuiltInJSTypeName["Generator"] = "Generator";
    BuiltInJSTypeName["AsyncGenerator"] = "AsyncGenerator";
})(BuiltInJSTypeName || (BuiltInJSTypeName = {}));
var NodePrefix;
(function (NodePrefix) {
    NodePrefix["Object"] = "object";
    NodePrefix["Symbol"] = "symbol";
    NodePrefix["Target"] = "target";
    NodePrefix["HeldValues"] = "heldValues";
    NodePrefix["KeyValueTuple"] = "keyValueTuple";
    NodePrefix["FinalizationTuple"] = "finalizationTuple";
    NodePrefix["PrivateName"] = "privateName";
    NodePrefix["PrivateFieldTuple"] = "privateFieldTuple";
})(NodePrefix || (NodePrefix = {}));
//#endregion nodes
//#region edges
var ChildReferenceEdgeType;
(function (ChildReferenceEdgeType) {
    ChildReferenceEdgeType["PropertyName"] = "PropertyName";
    ChildReferenceEdgeType["ArrayIndex"] = "ArrayIndex";
    ChildReferenceEdgeType["PropertySymbol"] = "PropertySymbol";
    ChildReferenceEdgeType["SymbolKey"] = "SymbolKey";
    ChildReferenceEdgeType["ScopeValue"] = "ScopeValue";
    ChildReferenceEdgeType["InstanceOf"] = "InstanceOf";
    ChildReferenceEdgeType["PrivateClassKey"] = "PrivateClassKey";
    ChildReferenceEdgeType["PrivateClassValue"] = "PrivateClassValue";
    ChildReferenceEdgeType["InternalSlot"] = "InternalSlot";
    ChildReferenceEdgeType["SetElement"] = "SetElement";
    ChildReferenceEdgeType["MapKey"] = "MapKey";
    ChildReferenceEdgeType["MapValue"] = "MapValue";
})(ChildReferenceEdgeType || (ChildReferenceEdgeType = {}));
var EdgePrefix;
(function (EdgePrefix) {
    EdgePrefix["PropertyKey"] = "propertyKey";
    EdgePrefix["GetterKey"] = "getterKey";
    EdgePrefix["HasSymbolAsKey"] = "hasSymbolAsKey";
    EdgePrefix["InstanceOf"] = "instanceOf";
    EdgePrefix["ScopeValue"] = "scopeValue";
    EdgePrefix["InternalSlot"] = "internalSlot";
    EdgePrefix["MapToTuple"] = "mapToTuple";
    EdgePrefix["MapKey"] = "mapKey";
    EdgePrefix["MapValue"] = "mapValue";
    EdgePrefix["SetValue"] = "setValue";
    EdgePrefix["FinalizationRegistryToTuple"] = "finalizationToTuple";
    EdgePrefix["FinalizationToTarget"] = "finalizationToTarget";
    EdgePrefix["FinalizationToHeldValue"] = "finalizationToHeldValue";
    EdgePrefix["FinalizationToUnregisterToken"] = "finalizationToUnregisterToken";
    EdgePrefix["ObjectToPrivateTuple"] = "privateTuple";
    EdgePrefix["PrivateTupleToKey"] = "privateKey";
    EdgePrefix["PrivateTupleToValue"] = "privateValue";
    EdgePrefix["PrivateTupleToGetter"] = "privateGetter";
})(EdgePrefix || (EdgePrefix = {}));
//#endregion edges

const OBJECT_OR_SYMBOL_TYPES = new Set(["symbol", "object", "function"]);
function isObjectOrSymbol(value) {
    return OBJECT_OR_SYMBOL_TYPES.has(typeof value);
}

class JointOwnershipTracker {
    #childKey;
    #jointOwnerKeys;
    #context;
    #resolver;
    #pendingValues;
    constructor(keyResolvedMap, childKey, jointOwnerKeys, context, resolver) {
        this.#childKey = childKey;
        this.#jointOwnerKeys = jointOwnerKeys.slice();
        this.#context = context;
        this.#resolver = resolver;
        this.#pendingValues = new Set(jointOwnerKeys.filter(v => !keyResolvedMap.get(v)));
    }
    keyWasResolved(key) {
        if (this.#pendingValues.delete(key))
            this.fireCallbackIfEmpty();
    }
    fireCallbackIfEmpty() {
        if (this.#pendingValues.size > 0)
            return;
        this.#resolver(this.#childKey, this.#jointOwnerKeys, this.#context, this);
    }
}

class StrongOwnershipSetsTracker {
    #keyResolvedMap = new Map;
    #keyToTrackerSets = new Map;
    #outerJointOwnersResolver;
    #innerJointOwnersResolver = (childKey, jointOwnerKeys, context, tracker) => {
        for (const ownerKey of jointOwnerKeys) {
            const innerSet = this.#keyToTrackerSets.get(ownerKey);
            innerSet.delete(tracker);
        }
        this.#outerJointOwnersResolver(childKey, jointOwnerKeys, context, this);
    };
    constructor(jointOwnersResolver) {
        this.#outerJointOwnersResolver = jointOwnersResolver;
    }
    hasKey(key) {
        return this.#keyResolvedMap.has(key);
    }
    defineKey(key) {
        if (this.#keyResolvedMap.has(key))
            throw new Error("key already defined: " + key);
        this.#keyResolvedMap.set(key, false);
        this.#keyToTrackerSets.set(key, new Set);
    }
    resolveKey(key) {
        const isResolved = this.#keyResolvedMap.get(key);
        if (isResolved === undefined)
            throw new Error("key not defined: " + key);
        if (isResolved === true)
            return;
        this.#keyResolvedMap.set(key, true);
        const innerSet = this.#keyToTrackerSets.get(key);
        for (const innerTracker of innerSet) {
            innerTracker.keyWasResolved(key);
        }
    }
    defineChildEdge(childKey, jointOwnerKeys, context) {
        for (const ownerKey of jointOwnerKeys) {
            if (!this.#keyResolvedMap.has(ownerKey))
                throw new Error("no resolved value defined for owner key " + ownerKey);
        }
        if (!this.#keyResolvedMap.has(childKey))
            throw new Error("no resolved value defined for child key " + childKey);
        const tracker = new JointOwnershipTracker(this.#keyResolvedMap, childKey, jointOwnerKeys, context, this.#innerJointOwnersResolver);
        for (const ownerKey of jointOwnerKeys) {
            const innerSet = this.#keyToTrackerSets.get(ownerKey);
            innerSet.add(tracker);
        }
        tracker.fireCallbackIfEmpty();
    }
}

function createValueDescription(value, objectGraph) {
    switch (typeof value) {
        case "bigint":
            return {
                valueType: ValueDiscrimant.BigInt,
                bigintStringValue: value.toString(),
            };
        case "symbol":
            return {
                valueType: ValueDiscrimant.Symbol,
                symbolId: objectGraph.getWeakKeyId(value),
            };
        case "boolean":
        case "number":
        case "string":
        case "undefined":
            return {
                valueType: ValueDiscrimant.Primitive,
                primitiveValue: value,
            };
        case "object":
            if (value === null) {
                return {
                    valueType: ValueDiscrimant.Primitive,
                    primitiveValue: null
                };
            }
            return {
                valueType: ValueDiscrimant.Object,
                objectId: objectGraph.getWeakKeyId(value),
            };
        case "function":
            return {
                valueType: ValueDiscrimant.Object,
                objectId: objectGraph.getWeakKeyId(value),
            };
    }
}

//#region preamble
var ObjectGraphState;
(function (ObjectGraphState) {
    ObjectGraphState[ObjectGraphState["AcceptingDefinitions"] = 0] = "AcceptingDefinitions";
    ObjectGraphState[ObjectGraphState["MarkingStrongReferences"] = 1] = "MarkingStrongReferences";
    ObjectGraphState[ObjectGraphState["MarkedStrongReferences"] = 2] = "MarkedStrongReferences";
    ObjectGraphState[ObjectGraphState["Summarizing"] = 3] = "Summarizing";
    ObjectGraphState[ObjectGraphState["Summarized"] = 4] = "Summarized";
    ObjectGraphState[ObjectGraphState["Error"] = Infinity] = "Error";
})(ObjectGraphState || (ObjectGraphState = {}));
class ObjectGraphImpl {
    static #NOT_APPLICABLE = Object.freeze({
        valueType: ValueDiscrimant.NotApplicable,
    });
    //#region private class fields
    #state = ObjectGraphState.AcceptingDefinitions;
    #targetId;
    #heldValuesId;
    #defineTargetCalled = false;
    #graph = new graphlib.Graph({ directed: true, multigraph: true });
    #nodeCounter = new StringCounter;
    #edgeCounter = new StringCounter;
    #weakKeyToIdMap = new WeakMap;
    #idToWeakKeyMap = new Map;
    #edgeIdToMetadataMap = new Map;
    #ownershipSetsTracker = new StrongOwnershipSetsTracker(this.#ownershipResolver.bind(this));
    #edgeIdTo_IsStrongReference_Map = new Map;
    #weakKeyHeldStronglyMap = new WeakMap;
    #weakKeyIdsToVisit = new Set;
    #edgeIdToJointOwnersMap_Weak = new Map;
    #edgeIdToJointOwnersMap_Strong = new Map;
    #searchedForStrongReferences = false;
    #strongReferenceCallback;
    #searchConfiguration;
    //#endregion private class fields
    constructor(searchConfiguration) {
        this.#targetId = "target:-1";
        this.#heldValuesId = "heldValues:-2";
        this.#searchConfiguration = searchConfiguration;
    }
    #throwInternalError(error) {
        if (this.#searchConfiguration?.internalErrorTrap) {
            this.#searchConfiguration.internalErrorTrap();
        }
        throw error;
    }
    defineTargetAndHeldValues(target, targetMetadata, heldValues, heldValuesMetadata) {
        this.#defineTargetCalled = true;
        this.#targetId = this.#defineWeakKey(target, targetMetadata, NodePrefix.Target);
        this.#heldValuesId = this.#defineWeakKey(heldValues, heldValuesMetadata, NodePrefix.HeldValues);
        this.#weakKeyHeldStronglyMap.delete(target);
    }
    #assertDefineTargetCalled() {
        if (!this.#defineTargetCalled) {
            this.#throwInternalError(new Error("you must call defineTargetAndHeldValues first!"));
        }
    }
    #setNextState(nextState) {
        this.#assertDefineTargetCalled();
        if (nextState >= this.#state) {
            this.#state = nextState;
        }
        else {
            this.#state = ObjectGraphState.Error;
            this.#throwInternalError(new Error("invalid state transition"));
        }
    }
    //#region CloneableGraphIfc
    cloneGraph() {
        this.#assertDefineTargetCalled();
        return graphlib.json.read(graphlib.json.write(this.#graph));
    }
    //#endregion CloneableGraphIfc
    //#region ValueIdIfc
    getWeakKeyId(weakKey) {
        this.#assertDefineTargetCalled();
        const id = this.#requireWeakKeyId(weakKey, "weakKey");
        if (id.startsWith("keyValueTuple") || id.startsWith("finalizationTuple"))
            this.#throwInternalError(new Error("object is a internal tuple, how did you get it?"));
        return id;
    }
    //#endregion ValueIdIfc
    //#region ObjectGraphIfc
    hasObject(object) {
        this.#assertDefineTargetCalled();
        return this.#weakKeyToIdMap.has(object);
    }
    hasSymbol(symbol) {
        this.#assertDefineTargetCalled();
        return this.#weakKeyToIdMap.has(symbol);
    }
    hasPrivateName(object) {
        this.#assertDefineTargetCalled();
        return this.#weakKeyToIdMap.has(object);
    }
    defineObject(object, metadata) {
        this.#defineWeakKey(object, metadata, NodePrefix.Object);
    }
    defineSymbol(symbol, metadata) {
        this.#defineWeakKey(symbol, metadata, NodePrefix.Symbol);
    }
    definePrivateName(privateName, description) {
        this.#setNextState(ObjectGraphState.AcceptingDefinitions);
        if (this.#weakKeyToIdMap.has(privateName)) {
            this.#throwInternalError(new Error("privateName is already defined as a node in this graph, with id " + this.#weakKeyToIdMap.get(privateName)));
        }
        const nodeId = this.#nodeCounter.next(NodePrefix.PrivateName);
        this.#weakKeyToIdMap.set(privateName, nodeId);
        this.#idToWeakKeyMap.set(nodeId, privateName);
        const nodeMetadata = {
            metadata: {
                description
            }
        };
        this.#graph.setNode(nodeId, nodeMetadata);
        this.#ownershipSetsTracker.defineKey(nodeId);
        this.#weakKeyHeldStronglyMap.set(privateName, false);
    }
    #defineWeakKey(weakKey, metadata, prefix) {
        this.#setNextState(ObjectGraphState.AcceptingDefinitions);
        if (this.#weakKeyToIdMap.has(weakKey)) {
            this.#throwInternalError(new Error("object is already defined as a node in this graph, with id " + this.#weakKeyToIdMap.get(weakKey)));
        }
        const nodeId = this.#nodeCounter.next(prefix);
        this.#weakKeyToIdMap.set(weakKey, nodeId);
        this.#idToWeakKeyMap.set(nodeId, weakKey);
        const nodeMetadata = { metadata };
        this.#graph.setNode(nodeId, nodeMetadata);
        this.#ownershipSetsTracker.defineKey(nodeId);
        this.#weakKeyHeldStronglyMap.set(weakKey, false);
        if (this.#searchConfiguration?.defineWeakKeyTrap) {
            this.#searchConfiguration.defineWeakKeyTrap(nodeId);
        }
        return nodeId;
    }
    #requireWeakKeyId(weakKey, identifier) {
        const id = this.#weakKeyToIdMap.get(weakKey);
        if (!id)
            this.#throwInternalError(new Error(identifier + " is not defined as a node"));
        return id;
    }
    #defineEdge(parentId, edgePrefixType, description, metadata, childId, isStrongReference, secondParentId) {
        const edgeId = this.#edgeCounter.next(edgePrefixType);
        const edgeMetadata = {
            edgeType: edgePrefixType,
            description,
            metadata,
        };
        const jointOwnerKeys = [parentId];
        if (secondParentId)
            jointOwnerKeys.push(secondParentId);
        this.#graph.setEdge(parentId, childId, edgeMetadata, edgeId);
        this.#edgeIdToMetadataMap.set(edgeId, edgeMetadata);
        if (childId === this.#targetId)
            this.#weakKeyHeldStronglyMap.set(this.#idToWeakKeyMap.get(this.#targetId), false);
        const keySet = new Set(jointOwnerKeys);
        this.#edgeIdToJointOwnersMap_Weak.set(edgeId, keySet);
        this.#ownershipSetsTracker.defineChildEdge(childId, jointOwnerKeys, edgeId);
        this.#edgeIdTo_IsStrongReference_Map.set(edgeId, isStrongReference);
        if (this.#searchConfiguration?.defineEdgeTrap) {
            this.#searchConfiguration.defineEdgeTrap(parentId, edgeId, childId, secondParentId, isStrongReference);
        }
        return edgeId;
    }
    defineAsSymbolKey(parentObject, relationshipName, keyEdgeMetadata) {
        this.#setNextState(ObjectGraphState.AcceptingDefinitions);
        const parentId = this.#requireWeakKeyId(parentObject, "parentObject");
        const relationshipId = this.#requireWeakKeyId(relationshipName, "childObject");
        const edgeId = this.#defineEdge(parentId, EdgePrefix.HasSymbolAsKey, ObjectGraphImpl.#NOT_APPLICABLE, keyEdgeMetadata, relationshipId, true, undefined);
        return edgeId;
    }
    #hasSymbolKeyEdge(edge) {
        return this.#graph.edgeAsObj(edge).edgeType === EdgePrefix.HasSymbolAsKey;
    }
    definePropertyOrGetter(parentObject, relationshipName, childObject, metadata, isGetter) {
        this.#setNextState(ObjectGraphState.AcceptingDefinitions);
        const parentId = this.#requireWeakKeyId(parentObject, "parentObject");
        const childId = this.#requireWeakKeyId(childObject, "childObject");
        if (typeof relationshipName === "symbol") {
            const symbolId = this.getWeakKeyId(relationshipName);
            const matchingEdges = this.#graph.outEdges(parentId, symbolId) ?? [];
            if (matchingEdges.some(edge => this.#hasSymbolKeyEdge(edge)) === false) {
                this.#throwInternalError(new Error(`no edge found between parent object "${parentId}" and symbol key "${symbolId}"`));
            }
        }
        const edgeId = this.#defineEdge(parentId, isGetter ? EdgePrefix.GetterKey : EdgePrefix.PropertyKey, createValueDescription(relationshipName, this), metadata, childId, true, undefined);
        return edgeId;
    }
    defineConstructorOf(instanceObject, ctorObject, metadata) {
        this.#setNextState(ObjectGraphState.AcceptingDefinitions);
        if (typeof ctorObject !== "function") {
            this.#throwInternalError(new Error("ctorObject must be a function!"));
        }
        const instanceId = this.#requireWeakKeyId(instanceObject, "instanceObject");
        const ctorId = this.#requireWeakKeyId(ctorObject, "ctorObject");
        const edgeId = this.#defineEdge(instanceId, EdgePrefix.InstanceOf, ObjectGraphImpl.#NOT_APPLICABLE, metadata, ctorId, true, undefined);
        return edgeId;
    }
    defineScopeValue(functionObject, identifier, objectValue, metadata) {
        this.#setNextState(ObjectGraphState.AcceptingDefinitions);
        if (typeof functionObject !== "function") {
            this.#throwInternalError(new Error("functionObject must be a function!"));
        }
        const functionId = this.#requireWeakKeyId(functionObject, "functionObject");
        const valueId = this.#requireWeakKeyId(objectValue, "objectValue");
        return this.#defineEdge(functionId, EdgePrefix.ScopeValue, createValueDescription(identifier, this), metadata, valueId, true, undefined);
    }
    defineInternalSlot(parentObject, slotName, childObject, isStrongReference, metadata) {
        this.#setNextState(ObjectGraphState.AcceptingDefinitions);
        const parentId = this.#requireWeakKeyId(parentObject, "parentObject");
        const childId = this.#requireWeakKeyId(childObject, "childObject");
        const edgeId = this.#defineEdge(parentId, EdgePrefix.InternalSlot, createValueDescription(slotName, this), metadata, childId, isStrongReference, undefined);
        return edgeId;
    }
    defineMapKeyValueTuple(map, key, value, isStrongReferenceToKey, keyMetadata, valueMetadata) {
        this.#setNextState(ObjectGraphState.AcceptingDefinitions);
        const mapId = this.#requireWeakKeyId(map, "map");
        let keyId;
        let valueId;
        if (isObjectOrSymbol(key) === false && isStrongReferenceToKey === false) {
            this.#throwInternalError(new Error("key must be a WeakKey"));
        }
        if (isObjectOrSymbol(key)) {
            keyId = this.#requireWeakKeyId(key, "key");
        }
        if (isObjectOrSymbol(value)) {
            valueId = this.#requireWeakKeyId(value, "value");
        }
        if (!keyId && !valueId)
            this.#throwInternalError(new Error("Why are you calling me when neither the key nor the value is an object?"));
        if (keyId && keyMetadata === undefined) {
            this.#throwInternalError(new Error("Need metadata for key"));
        }
        if (valueId && valueMetadata === undefined) {
            this.#throwInternalError(new Error("Need metadata for value"));
        }
        const tupleNodeId = this.#defineWeakKey({}, null, NodePrefix.KeyValueTuple);
        if (this.#searchConfiguration?.defineNodeTrap) {
            this.#searchConfiguration.defineNodeTrap(mapId, tupleNodeId, "(new map tuple)");
        }
        // map to tuple
        const mapToTupleEdgeId = this.#defineEdge(mapId, EdgePrefix.MapToTuple, ObjectGraphImpl.#NOT_APPLICABLE, null, tupleNodeId, true, undefined);
        const keyDescription = createValueDescription(key, this);
        // map key edge
        let tupleToKeyEdgeId;
        if (keyId) {
            tupleToKeyEdgeId = this.#defineEdge(tupleNodeId, EdgePrefix.MapKey, keyDescription, keyMetadata === undefined ? null : keyMetadata, keyId, isStrongReferenceToKey, undefined);
        }
        // map value edge
        let tupleToValueEdgeId;
        if (valueId) {
            tupleToValueEdgeId = this.#defineEdge(tupleNodeId, EdgePrefix.MapValue, createValueDescription(value, this), valueMetadata === undefined ? null : valueMetadata, valueId, true, keyId);
        }
        return {
            tupleNodeId,
            mapToTupleEdgeId,
            tupleToKeyEdgeId,
            tupleToValueEdgeId
        };
    }
    defineSetValue(set, value, isStrongReferenceToValue, metadata) {
        this.#setNextState(ObjectGraphState.AcceptingDefinitions);
        const setId = this.#requireWeakKeyId(set, "set");
        const valueId = this.#requireWeakKeyId(value, "value");
        const edgeId = this.#defineEdge(setId, EdgePrefix.SetValue, ObjectGraphImpl.#NOT_APPLICABLE, metadata, valueId, isStrongReferenceToValue, undefined);
        return edgeId;
    }
    defineFinalizationTuple(registry, target, heldValue, unregisterToken) {
        this.#setNextState(ObjectGraphState.AcceptingDefinitions);
        const registryId = this.#requireWeakKeyId(registry, "registry");
        const targetId = this.#requireWeakKeyId(target, "target");
        let heldValueId;
        if (isObjectOrSymbol(heldValue)) {
            heldValueId = this.#requireWeakKeyId(heldValue, "heldValue");
        }
        let unregisterTokenId;
        if (typeof unregisterToken !== "undefined" && unregisterToken !== target) {
            unregisterTokenId = this.#requireWeakKeyId(unregisterToken, "unregisterToken");
        }
        const tupleNodeId = this.#defineWeakKey({}, null, NodePrefix.FinalizationTuple);
        if (this.#searchConfiguration?.defineNodeTrap) {
            this.#searchConfiguration.defineNodeTrap(registryId, tupleNodeId, "(new finalization tuple)");
        }
        const registryToTupleEdgeId = this.#defineEdge(registryId, EdgePrefix.FinalizationRegistryToTuple, ObjectGraphImpl.#NOT_APPLICABLE, null, tupleNodeId, true, undefined);
        const tupleToTargetEdgeId = this.#defineEdge(tupleNodeId, EdgePrefix.FinalizationToTarget, createValueDescription(target, this), null, targetId, false, undefined);
        let tupleToHeldValueEdgeId;
        if (heldValueId) {
            tupleToHeldValueEdgeId = this.#defineEdge(tupleNodeId, EdgePrefix.FinalizationToHeldValue, createValueDescription(heldValue, this), null, heldValueId, true, targetId);
        }
        let tupleToUnregisterTokenEdgeId;
        if (unregisterTokenId) {
            tupleToUnregisterTokenEdgeId = this.#defineEdge(tupleNodeId, EdgePrefix.FinalizationToUnregisterToken, createValueDescription(unregisterToken, this), null, unregisterTokenId, false, targetId);
        }
        return {
            tupleNodeId,
            registryToTupleEdgeId,
            tupleToTargetEdgeId,
            tupleToHeldValueEdgeId,
            tupleToUnregisterTokenEdgeId,
        };
    }
    definePrivateField(parentObject, privateName, privateKey, childObject, privateNameMetadata, childMetadata, isGetter) {
        this.#setNextState(ObjectGraphState.AcceptingDefinitions);
        const parentId = this.#requireWeakKeyId(parentObject, "parentObject");
        const privateNameId = this.#requireWeakKeyId(privateName, "privateName");
        if (privateNameId.startsWith(NodePrefix.PrivateName) === false)
            throw new Error("privateName is not a registered private name!");
        const childId = this.#requireWeakKeyId(childObject, "childObject");
        const tupleNodeId = this.#defineWeakKey({}, null, NodePrefix.PrivateFieldTuple);
        if (this.#searchConfiguration?.defineNodeTrap) {
            this.#searchConfiguration.defineNodeTrap(parentId, tupleNodeId, "(new private field tuple)");
        }
        const objectToTupleEdgeId = this.#defineEdge(parentId, EdgePrefix.ObjectToPrivateTuple, ObjectGraphImpl.#NOT_APPLICABLE, null, tupleNodeId, true, undefined);
        const tupleToKeyEdgeId = this.#defineEdge(tupleNodeId, EdgePrefix.PrivateTupleToKey, ObjectGraphImpl.#NOT_APPLICABLE, privateNameMetadata, privateNameId, true, undefined);
        const tupleToValueEdgeId = this.#defineEdge(tupleNodeId, isGetter ? EdgePrefix.PrivateTupleToGetter : EdgePrefix.PrivateTupleToValue, createValueDescription(privateKey, this), childMetadata, childId, true, parentId);
        return {
            tupleNodeId,
            objectToTupleEdgeId,
            tupleToKeyEdgeId,
            tupleToValueEdgeId
        };
    }
    getEdgeRelationship(edgeId) {
        this.#assertDefineTargetCalled();
        return this.#edgeIdToMetadataMap.get(edgeId);
    }
    //#endregion ObjectGraphIfc
    //#region SearchReferencesIfc
    setStrongReferenceCallback(callback) {
        this.#setNextState(ObjectGraphState.MarkingStrongReferences);
        this.#strongReferenceCallback = callback;
    }
    #ownershipResolver(childKey, jointOwnerKeys, edgeId, tracker) {
        const isStrongReference = this.#edgeIdTo_IsStrongReference_Map.get(edgeId);
        if (isStrongReference && !this.#weakKeyIdsToVisit.has(childKey)) {
            this.#weakKeyIdsToVisit.add(childKey);
            const objectOrSymbol = this.#idToWeakKeyMap.get(childKey);
            this.#weakKeyHeldStronglyMap.set(objectOrSymbol, true);
            if (this.#strongReferenceCallback && /Tuple:/.test(childKey) === false) {
                this.#strongReferenceCallback(objectOrSymbol);
            }
            const keySet = new Set(jointOwnerKeys);
            this.#edgeIdToJointOwnersMap_Strong.set(edgeId, keySet);
        }
    }
    markStrongReferencesFromHeldValues() {
        this.#setNextState(ObjectGraphState.MarkingStrongReferences);
        this.#searchedForStrongReferences = true;
        const heldValues = this.#idToWeakKeyMap.get(this.#heldValuesId);
        this.#weakKeyHeldStronglyMap.set(heldValues, true);
        this.#weakKeyIdsToVisit.add(this.#heldValuesId);
        try {
            for (const id of this.#weakKeyIdsToVisit) {
                this.#ownershipSetsTracker.resolveKey(id);
            }
            this.#state = ObjectGraphState.MarkedStrongReferences;
        }
        catch (ex) {
            this.#state = ObjectGraphState.Error;
            throw ex;
        }
    }
    isKeyHeldStrongly(object) {
        this.#assertDefineTargetCalled();
        if (!this.#searchedForStrongReferences) {
            this.#throwInternalError(new Error("You haven't searched for strong references yet."));
        }
        this.#setNextState(ObjectGraphState.MarkedStrongReferences);
        return this.#weakKeyHeldStronglyMap.get(object) ?? false;
    }
    summarizeGraphToTarget(strongReferencesOnly) {
        this.#setNextState(ObjectGraphState.Summarizing);
        try {
            const summaryGraph = new graphlib.Graph({ directed: true, multigraph: true });
            const target = this.#idToWeakKeyMap.get(this.#targetId);
            const targetReference = this.#weakKeyHeldStronglyMap.get(target);
            let edgeIdToJointOwnersMap;
            if (strongReferencesOnly && targetReference === true) {
                edgeIdToJointOwnersMap = this.#edgeIdToJointOwnersMap_Strong;
            }
            else if (!strongReferencesOnly && targetReference !== undefined) {
                edgeIdToJointOwnersMap = this.#edgeIdToJointOwnersMap_Weak;
            }
            if (edgeIdToJointOwnersMap) {
                this.#summarizeGraphToTarget(summaryGraph, edgeIdToJointOwnersMap);
            }
            this.#graph = summaryGraph;
            this.#setNextState(ObjectGraphState.Summarized);
        }
        catch (ex) {
            this.#state = ObjectGraphState.Error;
            throw ex;
        }
    }
    #summarizeGraphToTarget(summaryGraph, edgeIdToJointOwnersMap) {
        const wNodeIds = new Set([this.#targetId]);
        for (const id of wNodeIds) {
            const wNode = this.#graph.node(id);
            if (!summaryGraph.node(id)) {
                summaryGraph.setNode(id, wNode);
            }
            const edges = this.#graph.inEdges(id);
            if (!edges)
                continue;
            for (const e of edges) {
                const vNodeId = e.v;
                if (!summaryGraph.node(vNodeId)) {
                    summaryGraph.setNode(vNodeId, this.#graph.node(vNodeId));
                }
                const edgeId = e.name;
                summaryGraph.setEdge(e, this.#graph.edge(e));
                const jointOwnerKeys = edgeIdToJointOwnersMap.get(edgeId);
                if (!jointOwnerKeys)
                    continue;
                for (const ownerKey of jointOwnerKeys) {
                    wNodeIds.add(ownerKey);
                }
            }
        }
    }
}

class InstanceGetterTracking {
    #definitions;
    #classToGetterKeysMap = new QuickWeakMapOfSets;
    #classToInstancesMap = new QuickWeakMapOfSets;
    #baseClassToDerivedClassMap = new QuickWeakMapOfSets;
    #derivedClassToBaseClassMap = new WeakMap;
    constructor(definitions) {
        this.#definitions = definitions;
    }
    *addInstance(instance, classObject) {
        this.#classToInstancesMap.add(classObject, instance);
        const classStack = [];
        let currentClass = classObject;
        do {
            classStack.unshift(currentClass);
            currentClass = this.#derivedClassToBaseClassMap.get(currentClass);
        } while (currentClass);
        while (classStack.length) {
            currentClass = classStack.shift();
            for (const key of this.#classToGetterKeysMap.mapValues(currentClass)) {
                yield* this.#definitions.defineInstanceGetter(instance, key);
            }
        }
    }
    *addBaseClass(derivedClass, baseClass) {
        this.#baseClassToDerivedClassMap.add(baseClass, derivedClass);
        this.#derivedClassToBaseClassMap.set(derivedClass, baseClass);
        for (const key of this.#classToGetterKeysMap.mapValues(baseClass)) {
            yield* this.#notifyFoundPublicKey(derivedClass, key);
        }
    }
    *addGetterName(baseClass, key) {
        this.#classToGetterKeysMap.add(baseClass, key);
        yield* this.#notifyFoundPublicKey(baseClass, key);
    }
    *#notifyFoundPublicKey(baseClass, key) {
        for (const instance of this.#classToInstancesMap.mapValues(baseClass)) {
            yield* this.#definitions.defineInstanceGetter(instance, key);
        }
        for (const derivedClass of this.#baseClassToDerivedClassMap.mapValues(baseClass)) {
            yield* this.#notifyFoundPublicKey(derivedClass, key);
        }
    }
}
class QuickWeakMapOfSets {
    #outerMap = new WeakMap;
    add(mapKey, setValue) {
        let innerSet = this.#outerMap.get(mapKey);
        if (!innerSet) {
            innerSet = new Set;
            this.#outerMap.set(mapKey, innerSet);
        }
        innerSet.add(setValue);
    }
    *mapValues(mapKey) {
        const innerSet = this.#outerMap.get(mapKey);
        if (innerSet) {
            yield* innerSet.values();
        }
    }
}

class HostValueSubstitution {
    #objectMap = new WeakMap;
    #symbolMap = new WeakMap;
    #privateKeysMap = new WeakMap;
    getHostValue(guestValue) {
        switch (guestValue.type) {
            case "BigInt":
                return guestValue.bigintValue();
            case "Boolean":
                return guestValue.booleanValue();
            case "Null":
                return null;
            case "Object":
                return this.getHostObject(guestValue);
            case "Undefined":
                return undefined;
            default:
                return this.getHostPropertyKey(guestValue);
        }
    }
    getHostPropertyKey(guestValue) {
        switch (guestValue.type) {
            case "Number":
                return guestValue.numberValue();
            case "String":
                return guestValue.stringValue();
            case "Symbol":
                return this.getHostSymbol(guestValue);
        }
    }
    getHostWeakKey(guestValue) {
        return guestValue.type === "Object" ? this.getHostObject(guestValue) : this.getHostSymbol(guestValue);
    }
    getHostObject(guestObject) {
        let hostObject = this.#objectMap.get(guestObject);
        if (!hostObject) {
            if (GuestEngine.IsCallable(guestObject) || GuestEngine.IsConstructor(guestObject))
                hostObject = function () { };
            else
                hostObject = {};
            this.#objectMap.set(guestObject, hostObject);
        }
        return hostObject;
    }
    getHostSymbol(guestSymbol) {
        let hostSymbol = this.#symbolMap.get(guestSymbol);
        if (!hostSymbol) {
            hostSymbol = Symbol();
            this.#symbolMap.set(guestSymbol, hostSymbol);
        }
        return hostSymbol;
    }
    getHostPrivateName(guestKey) {
        let hostObject = this.#privateKeysMap.get(guestKey);
        if (!hostObject) {
            hostObject = {};
            this.#privateKeysMap.set(guestKey, hostObject);
        }
        return hostObject;
    }
}

class GuestObjectGraphImpl {
    #hostGraph;
    #substitution = new HostValueSubstitution;
    #searchConfiguration;
    constructor(hostGraph, searchConfiguration) {
        this.#hostGraph = hostGraph;
        this.#searchConfiguration = searchConfiguration;
    }
    #throwInternalError(error) {
        if (this.#searchConfiguration?.internalErrorTrap) {
            this.#searchConfiguration.internalErrorTrap();
        }
        throw error;
    }
    defineTargetAndHeldValues(target, targetMetadata, heldValues, heldValuesMetadata) {
        this.#hostGraph.defineTargetAndHeldValues(this.#substitution.getHostWeakKey(target), targetMetadata, this.#substitution.getHostObject(heldValues), heldValuesMetadata);
    }
    getWeakKeyId(weakKey) {
        let hostKey;
        if (weakKey.type === "Object")
            hostKey = this.#substitution.getHostObject(weakKey);
        else
            hostKey = this.#substitution.getHostSymbol(weakKey);
        return this.#hostGraph.getWeakKeyId(hostKey);
    }
    hasObject(object) {
        return this.#hostGraph.hasObject(this.#substitution.getHostObject(object));
    }
    hasSymbol(symbol) {
        return this.#hostGraph.hasSymbol(this.#substitution.getHostSymbol(symbol));
    }
    hasPrivateName(privateName) {
        return this.#hostGraph.hasPrivateName(this.#substitution.getHostPrivateName(privateName));
    }
    defineObject(object, metadata) {
        return this.#hostGraph.defineObject(this.#substitution.getHostObject(object), metadata);
    }
    defineSymbol(symbol, metadata) {
        return this.#hostGraph.defineSymbol(this.#substitution.getHostSymbol(symbol), metadata);
    }
    definePrivateName(privateName, description) {
        return this.#hostGraph.definePrivateName(this.#substitution.getHostPrivateName(privateName), description);
    }
    defineAsSymbolKey(parentObject, relationshipName, keyEdgeMetadata) {
        return this.#hostGraph.defineAsSymbolKey(this.#substitution.getHostObject(parentObject), this.#substitution.getHostSymbol(relationshipName), keyEdgeMetadata);
    }
    definePropertyOrGetter(parentObject, guestRelationshipName, childObject, metadata, isGetter) {
        let relationshipName;
        if (typeof guestRelationshipName === "object") {
            relationshipName = this.#substitution.getHostSymbol(guestRelationshipName);
        }
        else {
            relationshipName = guestRelationshipName;
        }
        return this.#hostGraph.definePropertyOrGetter(this.#substitution.getHostObject(parentObject), relationshipName, this.#substitution.getHostWeakKey(childObject), metadata, isGetter);
    }
    defineConstructorOf(instanceObject, ctorObject, metadata) {
        if (!GuestEngine.IsConstructor(ctorObject)) {
            this.#throwInternalError(new Error("ctorObject is not a constructor"));
        }
        // preserving the graph order, though the graph _should_ have instanceObject already
        const hostInstance = this.#substitution.getHostObject(instanceObject);
        const hostCtor = this.#substitution.getHostObject(ctorObject);
        if (typeof hostCtor !== "function") {
            this.#throwInternalError(new Error("assertion failure: hostCtor should be a function"));
        }
        return this.#hostGraph.defineConstructorOf(hostInstance, hostCtor, metadata);
    }
    defineScopeValue(functionObject, identifier, objectValue, metadata) {
        if (!GuestEngine.isFunctionObject(functionObject)) {
            this.#throwInternalError(new Error("ctorObject is not a constructor"));
        }
        return this.#hostGraph.defineScopeValue(this.#substitution.getHostObject(functionObject), identifier, this.#substitution.getHostWeakKey(objectValue), metadata);
    }
    defineInternalSlot(parentObject, slotName, childObject, isStrongReference, metadata) {
        return this.#hostGraph.defineInternalSlot(this.#substitution.getHostObject(parentObject), slotName, this.#substitution.getHostObject(childObject), isStrongReference, metadata);
    }
    defineMapKeyValueTuple(map, key, value, isStrongReferenceToKey, keyMetadata, valueMetadata) {
        return this.#hostGraph.defineMapKeyValueTuple(this.#substitution.getHostObject(map), this.#substitution.getHostValue(key), this.#substitution.getHostValue(value), isStrongReferenceToKey, keyMetadata, valueMetadata);
    }
    defineSetValue(set, value, isStrongReferenceToValue, metadata) {
        return this.#hostGraph.defineSetValue(this.#substitution.getHostObject(set), this.#substitution.getHostWeakKey(value), isStrongReferenceToValue, metadata);
    }
    defineFinalizationTuple(registry, target, heldValue, unregisterToken) {
        return this.#hostGraph.defineFinalizationTuple(this.#substitution.getHostObject(registry), this.#substitution.getHostWeakKey(target), this.#substitution.getHostValue(heldValue), unregisterToken ? this.#substitution.getHostWeakKey(unregisterToken) : undefined);
    }
    definePrivateField(parentObject, privateName, privateKey, childObject, privateNameMetadata, childMetadata, isGetter) {
        return this.#hostGraph.definePrivateField(this.#substitution.getHostObject(parentObject), this.#substitution.getHostPrivateName(privateName), privateKey, this.#substitution.getHostWeakKey(childObject), privateNameMetadata, childMetadata, isGetter);
    }
    getEdgeRelationship(edgeId) {
        return this.#hostGraph.getEdgeRelationship(edgeId);
    }
}

function buildObjectMetadata(builtInJSTypeName, derivedClassName) {
    return {
        builtInJSTypeName,
        derivedClassName
    };
}

var _a;
class GraphBuilder {
    //#region private class fields and static private fields
    static #stringConstants = new Map([
        ["constructor", GuestEngine.Value("constructor")],
        ["length", GuestEngine.Value("length")],
        ["name", GuestEngine.Value("name")],
    ]);
    static #buildChildEdgeType(type) {
        return {
            parentToChildEdgeType: type
        };
    }
    static #builtInNamesFromInstrinsics(realm) {
        const { Intrinsics } = realm;
        return new Map([
            [Intrinsics["%Array.prototype%"], BuiltInJSTypeName.Array],
            [Intrinsics["%Object.prototype%"], BuiltInJSTypeName.Object],
            [Intrinsics["%AsyncFunction.prototype%"], BuiltInJSTypeName.AsyncFunction],
            [Intrinsics["%Function.prototype%"], BuiltInJSTypeName.Function],
            [Intrinsics["%WeakRef.prototype%"], BuiltInJSTypeName.WeakRef],
            [Intrinsics["%FinalizationRegistry.prototype%"], BuiltInJSTypeName.FinalizationRegistry],
            [Intrinsics["%Map.prototype%"], BuiltInJSTypeName.Map],
            [Intrinsics["%Set.prototype%"], BuiltInJSTypeName.Set],
            [Intrinsics["%WeakMap.prototype%"], BuiltInJSTypeName.WeakMap],
            [Intrinsics["%WeakSet.prototype%"], BuiltInJSTypeName.WeakSet],
            [Intrinsics["%Promise.prototype%"], BuiltInJSTypeName.Promise],
            [Intrinsics["%GeneratorPrototype%"], BuiltInJSTypeName.Generator],
            [Intrinsics["%AsyncGeneratorPrototype%"], BuiltInJSTypeName.AsyncGenerator],
            [Intrinsics["%ArrayIteratorPrototype%"], BuiltInJSTypeName.ArrayIterator],
            [Intrinsics["%MapIteratorPrototype%"], BuiltInJSTypeName.MapIterator],
            [Intrinsics["%SetIteratorPrototype%"], BuiltInJSTypeName.SetIterator],
        ]);
    }
    static *#isConstructorPrototype(guestObject) {
        const guestCtor = yield* EnsureTypeOrThrow(GuestEngine.GetV(guestObject, _a.#stringConstants.get("constructor")));
        if (GuestEngine.isFunctionObject(guestCtor) === false) {
            return false;
        }
        const guestCtorProto = yield* EnsureTypeOrThrow(GuestEngine.GetPrototypeFromConstructor(guestCtor, "%Object.prototype%"));
        return guestCtorProto === guestObject;
    }
    static *#isDirectReturnFunction(guestFunction) {
        {
            const lengthValue = yield* EnsureTypeOrThrow(GuestEngine.Get(guestFunction, _a.#stringConstants.get("length")));
            GuestEngine.Assert(lengthValue.type === "Number");
            const length = lengthValue.numberValue();
            if (length > 0)
                return false;
        }
        const type = guestFunction.ECMAScriptCode?.type;
        if (type === "ConciseBody") {
            return true;
        }
        if (type === "FunctionBody") {
            const { FunctionStatementList } = guestFunction.ECMAScriptCode;
            if (FunctionStatementList.length === 1 && FunctionStatementList[0].type === "ReturnStatement")
                return true;
        }
        return false;
    }
    #guestObjectGraph;
    #currentNodeId;
    #intrinsicToBuiltInNameMap;
    #intrinsics;
    #objectsToExcludeFromSearch = new Set;
    #objectQueue = new Set;
    #instanceGetterTracking = new InstanceGetterTracking(this);
    #searchConfiguration;
    //#endregion private class fields and static private fields
    resultsKey;
    sourceSpecifier;
    lineNumber;
    constructor(realm, hostObjectGraph, resultsKey, searchConfiguration) {
        this.resultsKey = resultsKey;
        {
            const callerContext = GuestEngine.surroundingAgent.executionContextStack[2];
            if ("HostDefined" in callerContext.ScriptOrModule)
                this.sourceSpecifier = callerContext.ScriptOrModule.HostDefined.specifier ?? "";
            else
                this.sourceSpecifier = "";
            this.lineNumber = callerContext.callSite.lineNumber ?? NaN;
        }
        this.#searchConfiguration = searchConfiguration;
        this.#intrinsicToBuiltInNameMap = _a.#builtInNamesFromInstrinsics(realm);
        this.#intrinsics = new WeakSet(Object.values(realm.Intrinsics));
        this.#guestObjectGraph = new GuestObjectGraphImpl(hostObjectGraph, this.#searchConfiguration);
    }
    *defineInstanceGetter(guestInstance, getterKey) {
        const guestKey = (typeof getterKey === "object" ? getterKey : GuestEngine.Value(getterKey.toString()));
        const guestValue = yield* EnsureTypeOrThrow(GuestEngine.GetV(guestInstance, guestKey));
        if (guestValue.type === "Object" || guestValue.type === "Symbol") {
            const details = "instance: key=" + (guestKey.type === "String" ? guestKey.stringValue() : "(symbol)");
            yield* this.#defineGraphNode(guestValue, false, details);
            this.#addObjectPropertyOrGetter(guestInstance, guestKey, guestValue, true);
        }
    }
    *run(targetValue, heldValues) {
        const targetMetadata = buildObjectMetadata(...yield* this.#getCollectionAndClassName(targetValue));
        const heldValuesMetadata = buildObjectMetadata(...yield* this.#getCollectionAndClassName(heldValues));
        this.#guestObjectGraph.defineTargetAndHeldValues(targetValue, targetMetadata, heldValues, heldValuesMetadata);
        if (targetValue.type === "Object")
            this.#objectsToExcludeFromSearch.add(targetValue);
        this.#objectQueue.add(heldValues);
        for (const guestObject of this.#objectQueue) {
            if (this.#objectsToExcludeFromSearch.has(guestObject)) {
                continue;
            }
            this.#currentNodeId = this.#guestObjectGraph.getWeakKeyId(guestObject);
            if (GuestEngine.isProxyExoticObject(guestObject)) {
                yield* this.#addInternalSlotIfObject(guestObject, "ProxyTarget", true, true);
                yield* this.#addInternalSlotIfObject(guestObject, "ProxyHandler", false, true);
            }
            else {
                yield* this.#addObjectProperties(guestObject);
                yield* this.#addPrivateFields(guestObject);
                yield* this.#addConstructorOf(guestObject);
                if ((this.#searchConfiguration?.noFunctionEnvironment !== true) &&
                    GuestEngine.isECMAScriptFunctionObject(guestObject)) {
                    // closures
                    yield* this.#addReferencesInFunction(guestObject);
                }
                yield* this.#lookupAndAddInternalSlots(guestObject);
            }
            this.#currentNodeId = undefined;
        }
    }
    //#region private methods
    #throwInternalError(error) {
        if (this.#searchConfiguration?.internalErrorTrap) {
            this.#searchConfiguration.internalErrorTrap();
        }
        throw error;
    }
    *#defineGraphNode(guestWeakKey, excludeFromSearch, details) {
        GuestEngine.Assert(("next" in guestWeakKey) === false);
        if (guestWeakKey.type === "Object") {
            yield* this.#defineGraphObjectNode(guestWeakKey, excludeFromSearch);
        }
        else {
            if (excludeFromSearch) {
                this.#throwInternalError(new Error("excludeFromSearch must not be true for a symbol!"));
            }
            this.#defineGraphSymbolNode(guestWeakKey);
        }
        const weakKey = this.#guestObjectGraph.getWeakKeyId(guestWeakKey);
        if (this.#searchConfiguration?.defineNodeTrap) {
            this.#searchConfiguration.defineNodeTrap(this.#currentNodeId, weakKey, details);
        }
        return weakKey;
    }
    *#defineGraphObjectNode(guestObject, excludeFromSearch) {
        if (this.#guestObjectGraph.hasObject(guestObject) === false) {
            const collectionAndClass = yield* this.#getCollectionAndClassName(guestObject);
            const objectMetadata = buildObjectMetadata(...collectionAndClass);
            this.#guestObjectGraph.defineObject(guestObject, objectMetadata);
            if (excludeFromSearch) {
                this.#objectsToExcludeFromSearch.add(guestObject);
            }
            this.#objectQueue.add(guestObject);
        }
    }
    #defineGraphSymbolNode(guestSymbol) {
        if (this.#guestObjectGraph.hasSymbol(guestSymbol) === false) {
            const objectMetadata = buildObjectMetadata(BuiltInJSTypeName.Symbol, BuiltInJSTypeName.Symbol);
            this.#guestObjectGraph.defineSymbol(guestSymbol, objectMetadata);
        }
    }
    *#getCollectionAndClassName(guestValue) {
        if (guestValue.type === "Symbol") {
            return [BuiltInJSTypeName.Symbol, BuiltInJSTypeName.Symbol];
        }
        if (GuestEngine.isProxyExoticObject(guestValue)) {
            return [BuiltInJSTypeName.Proxy, BuiltInJSTypeName.Proxy];
        }
        let isDirectMatch = true;
        let value = guestValue;
        let derivedClassName = "(unknown)";
        let proto = yield* EnsureTypeOrThrow(value.GetPrototypeOf());
        while (proto.type !== "Null") {
            const builtIn = this.#intrinsicToBuiltInNameMap.get(proto);
            if (builtIn) {
                return [builtIn, isDirectMatch ? builtIn : derivedClassName];
            }
            if (isDirectMatch) {
                const guestCtor = yield* EnsureTypeOrThrow(GuestEngine.GetV(value, _a.#stringConstants.get("constructor")));
                if (guestCtor.type === "Object") {
                    const guestName = yield* EnsureTypeOrThrow(GuestEngine.GetV(guestCtor, _a.#stringConstants.get("name")));
                    if (guestName.type === "String") {
                        derivedClassName = guestName.stringValue();
                    }
                }
                isDirectMatch = false;
            }
            value = proto;
            proto = yield* EnsureTypeOrThrow(value.GetPrototypeOf());
        }
        return [
            BuiltInJSTypeName.Object,
            isDirectMatch ? BuiltInJSTypeName.Object : derivedClassName
        ];
    }
    *#addObjectProperties(guestObject) {
        const isObjectPrototype = yield* _a.#isConstructorPrototype(guestObject);
        const OwnKeys = yield* EnsureTypeOrThrow(guestObject.OwnPropertyKeys());
        GuestEngine.Assert(Array.isArray(OwnKeys));
        for (const guestKey of OwnKeys) {
            if (guestKey.type === "Symbol") {
                this.#defineGraphSymbolNode(guestKey);
            }
            const descriptor = yield* guestObject.GetOwnProperty(guestKey);
            GuestEngine.Assert(descriptor instanceof GuestEngine.Descriptor);
            let childGuestValue;
            let isGetter;
            let key;
            if (guestKey.type === "Symbol") {
                key = guestKey;
            }
            else if (GuestEngine.isArrayIndex(guestKey)) {
                key = parseInt(guestKey.stringValue());
            }
            else {
                key = guestKey.stringValue();
            }
            if (GuestEngine.IsDataDescriptor(descriptor)) {
                GuestEngine.Assert(descriptor.Value !== undefined);
                childGuestValue = descriptor.Value;
                isGetter = false;
            }
            else {
                const guestCtor = yield* EnsureTypeOrThrow(GuestEngine.GetV(guestObject, _a.#stringConstants.get("constructor")));
                if (guestCtor.type === "Object" && this.#intrinsics.has(guestCtor) === false) {
                    yield* this.#instanceGetterTracking.addGetterName(guestCtor, key);
                }
                if (isObjectPrototype)
                    continue;
                /* In the case of getters, this can definitely have side effects.  For instance, the getter
                could trigger code to delete something.  Well, too bad, this is what we have to do to get
                the answer.
        
                GetV can also throw if guestObject is a prototype and guestObject[guestKey] refers to this.
                */
                const childOrCompletion = yield* EnsureTypeOrThrow(GuestEngine.GetV(guestObject, guestKey));
                if (childOrCompletion instanceof GuestEngine.ThrowCompletion)
                    continue;
                if (childOrCompletion instanceof GuestEngine.NormalCompletion)
                    childGuestValue = childOrCompletion.Value;
                else
                    childGuestValue = childOrCompletion;
                isGetter = true;
            }
            if (this.#intrinsics.has(childGuestValue))
                continue;
            if (childGuestValue.type === "Object" || childGuestValue.type === "Symbol") {
                let details = `addObjectProperties: `;
                if (typeof key !== "object") {
                    details += "key=" + key;
                }
                else {
                    details += "key=(symbol)";
                }
                yield* this.#defineGraphNode(childGuestValue, false, details);
                this.#addObjectPropertyOrGetter(guestObject, guestKey, childGuestValue, isGetter);
            }
        }
    }
    #addObjectPropertyOrGetter(parentObject, guestKey, childObject, isGetter) {
        let key;
        let valueRelationship;
        if (GuestEngine.isArrayIndex(guestKey)) {
            GuestEngine.Assert(guestKey.type === "String");
            key = parseInt(guestKey.stringValue());
            valueRelationship = _a.#buildChildEdgeType(ChildReferenceEdgeType.ArrayIndex);
        }
        else if (guestKey.type === "String") {
            key = guestKey.stringValue();
            valueRelationship = _a.#buildChildEdgeType(ChildReferenceEdgeType.PropertyName);
        }
        else {
            //this.#defineGraphSymbolNode(key);
            const keyRelationship = _a.#buildChildEdgeType(ChildReferenceEdgeType.SymbolKey);
            this.#guestObjectGraph.defineAsSymbolKey(parentObject, guestKey, keyRelationship);
            key = guestKey;
            valueRelationship = _a.#buildChildEdgeType(ChildReferenceEdgeType.PropertySymbol);
        }
        this.#guestObjectGraph.definePropertyOrGetter(parentObject, key, childObject, valueRelationship, isGetter);
    }
    *#addPrivateFields(guestObject) {
        for (const element of guestObject.PrivateElements) {
            const { Key, Kind } = element;
            const privateKey = Key.Description.stringValue();
            GuestEngine.Assert(privateKey.startsWith("#"));
            if (this.#guestObjectGraph.hasPrivateName(Key) === false) {
                this.#guestObjectGraph.definePrivateName(Key, privateKey);
            }
            let guestValue;
            if (Kind === "accessor") {
                const { Get } = element;
                if (Get?.type !== "Object")
                    continue;
                guestValue = yield* EnsureTypeOrThrow(GuestEngine.PrivateGet(guestObject, Key));
            }
            else {
                const { Value } = element;
                GuestEngine.Assert(Value !== undefined);
                guestValue = Value;
            }
            if (guestValue.type !== "Object" && guestValue.type !== "Symbol")
                continue;
            yield* this.#defineGraphNode(guestValue, false, "addPrivateFields: key=" + privateKey);
            const privateNameMetadata = _a.#buildChildEdgeType(ChildReferenceEdgeType.PrivateClassKey);
            const privateValueMetadata = _a.#buildChildEdgeType(ChildReferenceEdgeType.PrivateClassValue);
            this.#guestObjectGraph.definePrivateField(guestObject, Key, privateKey, guestValue, privateNameMetadata, privateValueMetadata, Kind === "accessor");
        }
    }
    *#lookupAndAddInternalSlots(guestObject) {
        if (GuestEngine.IsConstructor(guestObject)) {
            const kind = Reflect.get(guestObject, "ConstructorKind");
            if (kind === "derived") {
                const proto = Reflect.get(guestObject, "Prototype");
                if (proto.type !== "Null" && this.#intrinsics.has(proto) === false) {
                    yield* this.#addInternalSlotIfObject(guestObject, "Prototype", false, true);
                    yield* this.#instanceGetterTracking.addBaseClass(guestObject, proto);
                }
            }
        }
        const internalSlots = new Set(guestObject.internalSlotsList);
        if (internalSlots.has("RevocableProxy")) {
            yield* this.#addInternalSlotIfObject(guestObject, "RevocableProxy", false, true);
            return;
        }
        if (internalSlots.has("WeakRefTarget")) {
            yield* this.#addInternalSlotIfObject(guestObject, "WeakRefTarget", false, false);
            return;
        }
        if (internalSlots.has("CleanupCallback")) {
            const { Callback } = Reflect.get(guestObject, "CleanupCallback");
            if (Callback.type === "Object") {
                yield* this.#defineGraphNode(Callback, false, `internal slot: [[CleanupCallback]]`);
                const edgeRelationship = _a.#buildChildEdgeType(ChildReferenceEdgeType.InternalSlot);
                this.#guestObjectGraph.defineInternalSlot(guestObject, `[[CleanupCallback]]`, Callback, true, edgeRelationship);
            }
            if (internalSlots.has("Cells")) {
                const cells = Reflect.get(guestObject, "Cells");
                for (const cell of cells) {
                    yield* this.#addInternalFinalizationCell(guestObject, cell);
                }
            }
            return;
        }
        if (internalSlots.has("SetData")) {
            yield* this.#addSetData(guestObject, "SetData");
            return;
        }
        if (internalSlots.has("WeakSetData")) {
            yield* this.#addSetData(guestObject, "WeakSetData");
            return;
        }
        if (internalSlots.has("MapData")) {
            yield* this.#addMapData(guestObject, "MapData");
            return;
        }
        if (internalSlots.has("WeakMapData")) {
            yield* this.#addMapData(guestObject, "WeakMapData");
            return;
        }
        if (internalSlots.has("BoundTargetFunction")) {
            yield* this.#addInternalSlotIfObject(guestObject, "BoundTargetFunction", false, true);
            if (internalSlots.has("BoundThis"))
                yield* this.#addInternalSlotIfObject(guestObject, "BoundThis", false, true);
            if (internalSlots.has("BoundArguments")) {
                yield* this.#addInternalSlotIfList(guestObject, "BoundArguments");
            }
            return;
        }
        if (internalSlots.has("PromiseResult")) {
            yield* this.#addInternalSlotIfObject(guestObject, "PromiseResult", false, true);
            yield* this.#addInternalPromiseRecordsList(guestObject, "PromiseFulfillReactions");
            yield* this.#addInternalPromiseRecordsList(guestObject, "PromiseRejectReactions");
        }
    }
    *#addInternalSlotIfObject(parentObject, slotName, excludeFromSearches, isStrongReference) {
        const slotObject = Reflect.get(parentObject, slotName);
        if (slotObject.type !== "Object")
            return;
        yield* this.#defineGraphNode(slotObject, excludeFromSearches, `internal slot object: slotName`);
        const edgeRelationship = _a.#buildChildEdgeType(ChildReferenceEdgeType.InternalSlot);
        this.#guestObjectGraph.defineInternalSlot(parentObject, `[[${slotName}]]`, slotObject, isStrongReference, edgeRelationship);
    }
    *#addInternalSlotIfList(parentObject, slotName) {
        const slotArray = Reflect.get(parentObject, slotName);
        if (slotArray === undefined)
            return;
        const guestArray = GuestEngine.CreateArrayFromList(slotArray);
        yield* this.#defineGraphNode(guestArray, false, `internal slot list: ${slotName}`);
        const edgeRelationship = _a.#buildChildEdgeType(ChildReferenceEdgeType.InternalSlot);
        this.#guestObjectGraph.defineInternalSlot(parentObject, `[[${slotName}]]`, guestArray, true, edgeRelationship);
    }
    *#addInternalPromiseRecordsList(promiseObject, slotName) {
        const records = Reflect.get(promiseObject, slotName);
        if (records === undefined)
            return;
        const handlers = records.map(r => r.Handler).filter(Boolean);
        const callbacks = handlers.map(h => h.Callback);
        const guestArray = GuestEngine.CreateArrayFromList(callbacks);
        yield* this.#defineGraphNode(guestArray, false, "internal slot:" + slotName);
        const edgeRelationship = _a.#buildChildEdgeType(ChildReferenceEdgeType.InternalSlot);
        this.#guestObjectGraph.defineInternalSlot(promiseObject, `[[${slotName}]]`, guestArray, true, edgeRelationship);
    }
    *#addInternalFinalizationCell(registry, cell) {
        let WeakRefTarget;
        if (cell.WeakRefTarget?.type === "Object" || cell.WeakRefTarget?.type === "Symbol")
            WeakRefTarget = cell.WeakRefTarget;
        else
            return;
        const { HeldValue } = cell;
        let UnregisterToken;
        if (cell.UnregisterToken?.type === "Object" || cell.UnregisterToken?.type === "Symbol")
            UnregisterToken = cell.UnregisterToken;
        yield* this.#defineGraphNode(WeakRefTarget, false, "finalization cell target");
        if (HeldValue.type === "Object" || HeldValue.type === "Symbol")
            yield* this.#defineGraphNode(HeldValue, false, "finalization cell heldValue");
        if (UnregisterToken)
            yield* this.#defineGraphNode(UnregisterToken, false, "finalization cell unregisterToken");
        this.#guestObjectGraph.defineFinalizationTuple(registry, WeakRefTarget, HeldValue, UnregisterToken);
    }
    *#addConstructorOf(guestObject) {
        const guestCtor = yield* EnsureTypeOrThrow(GuestEngine.GetV(guestObject, _a.#stringConstants.get("constructor")));
        if (GuestEngine.isFunctionObject(guestCtor) === false) {
            // generators end up here
            return;
        }
        const guestCtorProto = yield* EnsureTypeOrThrow(GuestEngine.GetPrototypeFromConstructor(guestCtor, "%Object.prototype%"));
        if (this.#intrinsics.has(guestCtorProto))
            return;
        if (guestCtorProto === guestObject)
            return;
        GuestEngine.Assert(guestCtor.type === "Object");
        GuestEngine.Assert(GuestEngine.IsConstructor(guestCtor));
        yield* this.#defineGraphNode(guestCtor, false, "constructor");
        const edgeRelationship = _a.#buildChildEdgeType(ChildReferenceEdgeType.InstanceOf);
        this.#guestObjectGraph.defineConstructorOf(guestObject, guestCtor, edgeRelationship);
        yield* this.#instanceGetterTracking.addInstance(guestObject, guestCtor);
    }
    *#addMapData(mapObject, slotName) {
        const elements = Reflect.get(mapObject, slotName);
        for (const { Key, Value } of elements) {
            if (Key.type !== "Object" && Value.type !== "Object") {
                continue;
            }
            let keyRelationship;
            let valueRelationship;
            if (Key.type === "Object" || Key.type === "Symbol") {
                yield* this.#defineGraphNode(Key, false, "map key");
                keyRelationship = _a.#buildChildEdgeType(ChildReferenceEdgeType.MapKey);
            }
            if (Value.type === "Object" || Value.type === "Symbol") {
                yield* this.#defineGraphNode(Value, false, "map value");
                valueRelationship = _a.#buildChildEdgeType(ChildReferenceEdgeType.MapValue);
            }
            this.#guestObjectGraph.defineMapKeyValueTuple(mapObject, Key, Value, slotName === "MapData", keyRelationship, valueRelationship);
        }
    }
    *#addSetData(parentObject, slotName) {
        const elements = Reflect.get(parentObject, slotName);
        for (const value of elements) {
            if (value.type === "Object" || value.type === "Symbol") {
                yield* this.#defineGraphNode(value, false, "set value");
                const edgeRelationship = _a.#buildChildEdgeType(ChildReferenceEdgeType.SetElement);
                this.#guestObjectGraph.defineSetValue(parentObject, value, slotName === "SetData", edgeRelationship);
            }
        }
    }
    *#addReferencesInFunction(guestFunction) {
        // the 'arguments' property is off-limits... engine262 throws for this.
        const visitedNames = new Set(["arguments"]);
        let env = guestFunction.Environment;
        let thisValue = undefined;
        if (env instanceof GuestEngine.FunctionEnvironmentRecord) {
            if (env.HasThisBinding() === GuestEngine.Value.true) {
                const thisBinding = env.GetThisBinding();
                GuestEngine.Assert(thisBinding instanceof GuestEngine.Value);
                thisValue = thisBinding;
                yield* this.#buildFunctionValueReference(guestFunction, "this", thisBinding);
            }
            if (env.HasSuperBinding() === GuestEngine.Value.true) {
                const superBinding = env.GetSuperBase();
                yield* this.#buildFunctionValueReference(guestFunction, "super", superBinding);
            }
        }
        while (env instanceof GuestEngine.FunctionEnvironmentRecord) {
            for (const [guestName, guestValue] of env.bindings.entries()) {
                const hostName = guestName.stringValue();
                if (visitedNames.has(hostName))
                    continue;
                visitedNames.add(hostName);
                yield* this.#buildFunctionValueReference(guestFunction, hostName, guestValue.value ?? GuestEngine.Value.undefined);
            }
            env = env.OuterEnv;
        }
        if (yield* _a.#isDirectReturnFunction(guestFunction)) {
            // here be dragons: not sure if `this` will be the right value for a given module
            thisValue ??= GuestEngine.surroundingAgent.currentRealmRecord.GlobalObject;
            const result = yield* EnsureTypeOrThrow(guestFunction.Call(thisValue, []));
            if (result.type === "Object" || result.type === "Symbol") {
                yield* this.#buildFunctionValueReference(guestFunction, `[[return value]]`, result);
            }
        }
    }
    *#buildFunctionValueReference(guestFunction, nameOfValue, guestValue) {
        if (guestValue.type !== "Object" && guestValue.type !== "Symbol")
            return;
        yield* this.#defineGraphNode(guestValue, false, "function reference: " + nameOfValue);
        const relationship = _a.#buildChildEdgeType(ChildReferenceEdgeType.ScopeValue);
        this.#guestObjectGraph.defineScopeValue(guestFunction, nameOfValue, guestValue, relationship);
    }
}
_a = GraphBuilder;

//#endregion preamble
class SearchDriver {
    #strongReferencesOnly;
    #graphBuilder;
    #searchReferences;
    #cloneableGraph;
    #targetValue;
    #heldValues;
    #searchConfiguration;
    constructor(targetValue, heldValues, strongReferencesOnly, realm, resultsKey, searchConfiguration) {
        this.#targetValue = targetValue;
        this.#heldValues = heldValues;
        this.#strongReferencesOnly = strongReferencesOnly;
        this.#searchConfiguration = searchConfiguration;
        const hostGraphImpl = new ObjectGraphImpl(searchConfiguration);
        this.#graphBuilder = new GraphBuilder(realm, hostGraphImpl, resultsKey, searchConfiguration);
        this.#cloneableGraph = hostGraphImpl;
        this.#searchReferences = hostGraphImpl;
    }
    *run() {
        if (this.#searchConfiguration?.beginSearch) {
            this.#searchConfiguration.beginSearch(this.#graphBuilder.sourceSpecifier, this.#graphBuilder.resultsKey);
        }
        try {
            yield* this.#graphBuilder.run(this.#targetValue, this.#heldValues);
            if (this.#strongReferencesOnly) {
                this.#searchReferences.markStrongReferencesFromHeldValues();
            }
            this.#searchReferences.summarizeGraphToTarget(this.#strongReferencesOnly);
            const graph = this.#cloneableGraph.cloneGraph();
            if (graph.nodeCount() === 0)
                return null;
            return graph;
        }
        finally {
            if (this.#searchConfiguration?.endSearch) {
                this.#searchConfiguration.endSearch(this.#graphBuilder.sourceSpecifier, this.#graphBuilder.resultsKey);
            }
        }
    }
}

function* defineBuiltInFunction(realm, name, 
/* argumentsLength: number */
callback) {
    const argumentsLength = 1;
    function* builtInConverter(guestArguments, thisAndNewValue) {
        try {
            return yield* callback(thisAndNewValue.thisValue, guestArguments, thisAndNewValue.NewTarget);
        }
        catch (ex) {
            if (ex instanceof GuestEngine.ThrowCompletion)
                return ex;
            return GuestEngine.Throw("Error", "Raw", "HostDefinedError: " + String(ex));
        }
    }
    const builtInName = GuestEngine.Value(name);
    const builtInCallback = GuestEngine.CreateBuiltinFunction(builtInConverter, argumentsLength, builtInName, []);
    yield* GuestEngine.CreateDataProperty(realm.GlobalObject, builtInName, builtInCallback);
}

function* defineSearchReferences(realm, searchResultsMap, searchConfiguration) {
    yield* defineBuiltInFunction(realm, "searchReferences", function* performGuestSearch(guestThisArg, guestArguments, guestNewTarget) {
        void (guestThisArg);
        void (guestNewTarget);
        const searchArgs = yield* EnsureTypeOrThrow(extractSearchParameters(guestArguments));
        if (searchResultsMap.has(searchArgs.resultsKey)) {
            throw GuestEngine.Throw("Error", "Raw", `You already have a search with the results key ${JSON.stringify(searchArgs.resultsKey)}`);
        }
        const searchDriver = new SearchDriver(searchArgs.targetValue, searchArgs.heldValuesArray, searchArgs.strongReferencesOnly, realm, searchArgs.resultsKey, searchConfiguration);
        const graphOrNull = yield* searchDriver.run();
        searchResultsMap.set(searchArgs.resultsKey, graphOrNull);
        return GuestEngine.Value.undefined;
    });
}
function* extractSearchParameters(guestArguments) {
    const [resultsKeyGuest, targetValue, heldValuesArrayGuest, strongRefsGuest] = guestArguments;
    if (resultsKeyGuest?.type !== "String") {
        throw GuestEngine.Throw("TypeError", "Raw", "resultsKey is not a string");
    }
    if (targetValue?.type !== "Object" && targetValue?.type !== "Symbol") {
        throw GuestEngine.Throw("TypeError", "NotAWeakKey", targetValue);
    }
    if (heldValuesArrayGuest.type !== "Object") {
        throw GuestEngine.Throw('TypeError', "Raw", "Expected an Array object");
    }
    const heldValuesRaw = yield* EnsureTypeOrThrow(convertArrayValueToArrayOfValues(heldValuesArrayGuest));
    for (let i = 0; i < heldValuesRaw.length; i++) {
        if (heldValuesRaw[i].type !== "Object" && heldValuesRaw[i].type !== "Symbol")
            throw GuestEngine.Throw("TypeError", "NotAWeakKey", heldValuesRaw[i]);
    }
    if (strongRefsGuest?.type !== "Boolean")
        throw GuestEngine.Throw("TypeError", "Raw", "strongReferencesOnly is not a boolean");
    return {
        resultsKey: resultsKeyGuest.stringValue(),
        targetValue,
        heldValuesArray: heldValuesArrayGuest,
        strongReferencesOnly: strongRefsGuest.booleanValue(),
    };
}

/** @deprecated use `Promise.withResolvers()` instead. */
class Deferred {
    resolve;
    reject;
    promise;
    constructor() {
        this.resolve = (value) => {
        };
        this.reject = (reason) => {
            throw reason;
        };
        this.promise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
}

class RealmHostDefined {
    #driver;
    #pendingHostPromises = new Set;
    constructor(outer) {
        this.#driver = outer;
    }
    promiseRejectionTracker(promise, operation) {
        switch (operation) {
            case 'reject':
                this.#driver.trackedPromises.add(promise);
                break;
            case 'handle':
                this.#driver.trackedPromises.delete(promise);
                break;
        }
    }
    registerHostPromise(p) {
        this.#pendingHostPromises.add(p);
        p.finally(() => this.#pendingHostPromises.delete(p));
    }
    hasPendingPromises() {
        return this.#pendingHostPromises.size > 0;
    }
    /*
    public getImportMetaProperties(...args: unknown[]): unknown {
    }
   
    public finalizeImportMeta(...args: unknown[]): unknown {
    }
   
    get public(): never {
      throw new Error("what is this?");
    }
   
    get specifier(): never {
      throw new Error("what should this be?");
    }
    */
    randomSeed;
}

/*
import {
  convertGuestPromiseToVoidHostPromise
} from "./HostPromiseForGuestPromise.js";
*/
async function runInRealm(inputs) {
    const contents = await fs.promises.readFile(inputs.absolutePathToFile, { "encoding": "utf-8" });
    const realmDriver = new RealmDriver;
    const agent = new GuestEngine.Agent({
        onDebugger() {
            // eslint-disable-next-line no-debugger
            debugger;
        },
        // ensureCanCompileStrings() {},
        // hasSourceTextAvailable() {},
        loadImportedModule(referrer, specifier, hostDefined, finish) {
            const moduleOrThrow = realmDriver.resolveModule(specifier, referrer);
            finish(moduleOrThrow);
        },
        // onNodeEvaluation() {},
        // features: [],
    });
    GuestEngine.setSurroundingAgent(agent);
    const realm = new GuestEngine.ManagedRealm(realmDriver.hostDefined);
    realm.scope(function () {
        if (inputs.defineBuiltIns) {
            GuestEngine.skipDebugger(inputs.defineBuiltIns(realm));
        }
        const specifier = pathToFileURL(inputs.absolutePathToFile).href;
        let module = realm.compileModule(contents, { specifier });
        if (module instanceof GuestEngine.NormalCompletion)
            module = module.Value;
        if (module instanceof GuestEngine.SourceTextModuleRecord) {
            realmDriver.registerMainModule(specifier, module);
            return realm.evaluateModule(module, specifier);
        }
    });
    //await realmDriver.moduleCompleted;
    return realm.scope(() => realmDriver.finalizeResults());
}
class RealmDriver {
    #exceptionThrown = false;
    #results = new RealmResults;
    resolverCache = new Map;
    #specifierToModuleRecordMap = new Map;
    #moduleRecordToSpecifierMap = new WeakMap;
    trackedPromises = new Set;
    hostDefined = new RealmHostDefined(this);
    resolveModulePromises = new Set;
    #moduleCompletedDeferred = new Deferred;
    moduleCompleted = this.#moduleCompletedDeferred.promise;
    #mainModule;
    loadRequestResult;
    evalResult;
    registerMainModule(specifier, module) {
        this.#specifierToModuleRecordMap.set(specifier, module);
        this.#moduleRecordToSpecifierMap.set(module, specifier);
    }
    resolveModule(targetSpecifier, referrer) {
        return this.#resolveModule(targetSpecifier, referrer);
    }
    #resolveModule(targetSpecifier, referrer) {
        GuestEngine.Assert(referrer.Realm instanceof GuestEngine.ManagedRealm);
        const sourceSpecifier = this.#moduleRecordToSpecifierMap.get(referrer);
        const resolvedSpecifier = resolve(targetSpecifier, sourceSpecifier);
        const cachedModule = this.#specifierToModuleRecordMap.get(resolvedSpecifier);
        if (cachedModule)
            return cachedModule;
        if (!resolvedSpecifier.startsWith("file://"))
            return GuestEngine.Throw("Error", "CouldNotResolveModule", targetSpecifier);
        const absolutePathToFile = fileURLToPath(resolvedSpecifier);
        const contents = fs.readFileSync(absolutePathToFile, { "encoding": "utf-8" });
        let module = referrer.Realm.compileModule(contents, { specifier: resolvedSpecifier });
        if (module instanceof GuestEngine.NormalCompletion)
            module = module.Value;
        if (module instanceof GuestEngine.SourceTextModuleRecord) {
            this.#specifierToModuleRecordMap.set(resolvedSpecifier, module);
            this.#moduleRecordToSpecifierMap.set(module, resolvedSpecifier);
        }
        return module;
    }
    flushPendingPromises() {
        GuestEngine.Assert(this.#mainModule !== undefined);
        GuestEngine.Assert(this.evalResult !== undefined);
        this.#mainModule.Evaluate();
    }
    finalizeResults() {
        if (this.trackedPromises.size) {
            this.#results.unhandledPromises.push(...this.trackedPromises);
            const unhandledRejects = Array.from(this.trackedPromises);
            const unhandledErrors = unhandledRejects.map(value => new Error(GuestEngine.inspect(value)));
            this.#results.unhandledErrors.push(...unhandledErrors);
            this.#exceptionThrown = true;
        }
        this.#results.succeeded = !this.#exceptionThrown;
        return this.#results;
    }
}
class RealmResults {
    unhandledPromises = [];
    unhandledErrors = [];
    succeeded = false;
}

async function directInvoke(realmInputs) {
    return await runInRealm({
        absolutePathToFile: realmInputs.absolutePathToFile,
        defineBuiltIns: function* (realm) {
            if (realmInputs.defineBuiltIns)
                yield* realmInputs.defineBuiltIns(realm);
        }
    });
}

async function runSearchesInGuestEngine(absolutePathToFile, searchConfiguration) {
    const graphs = new Map;
    const outputs = await directInvoke({
        absolutePathToFile,
        defineBuiltIns: function* (realm) {
            yield* defineSearchReferences(realm, graphs, searchConfiguration);
        }
    });
    if (outputs.succeeded === false) {
        throw new Error("evaluating module in guest engine failed: " + absolutePathToFile);
    }
    return graphs;
}

class LoggingConfiguration {
    static #hashSpecifierAndKey(referenceSpec, resultsKey) {
        return referenceSpec + ": " + resultsKey;
    }
    #logsMap = new Map;
    #tracingHash = "";
    //#region SearchConfiguration
    noFunctionEnvironment = false;
    beginSearch(sourceSpecifier, resultsKey) {
        this.#tracingHash = LoggingConfiguration.#hashSpecifierAndKey(sourceSpecifier, resultsKey);
        this.log("enter " + this.#tracingHash, true);
    }
    endSearch(sourceSpecifier, resultsKey) {
        this.log("leave " + this.#tracingHash, true);
        this.#tracingHash = "";
    }
    internalErrorTrap() {
        // eslint-disable-next-line no-debugger
        debugger;
    }
    log(message, noIndent) {
        if (!noIndent)
            message = "  " + message;
        if (this.#logsMap.has(this.#tracingHash) === false) {
            this.#logsMap.set(this.#tracingHash, []);
        }
        this.#logsMap.get(this.#tracingHash).push(message);
    }
    defineNodeTrap(parentId, weakKey, details) {
        this.log(`defineNode: parentId=${parentId} weakKeyId=${weakKey} ${details}`);
    }
    defineEdgeTrap(parentId, edgeId, childId, secondParentId, isStrongReference) {
        const secondIdPart = secondParentId ? " + " + secondParentId : "";
        this.log(`defineEdgeTrap: ${parentId}${secondIdPart} via ${edgeId} to ${childId}, isStrongReference: ${isStrongReference}`);
    }
    defineWeakKeyTrap(weakKey) {
        this.log(`defineWeakKey: ${weakKey}`);
    }
    //#endregion SearchConfiguration
    retrieveLogs(sourceSpecifier, resultsKey) {
        const tracingHash = LoggingConfiguration.#hashSpecifierAndKey(sourceSpecifier, resultsKey);
        return this.#logsMap.get(tracingHash);
    }
}

export { LoggingConfiguration, runSearchesInGuestEngine as default };
