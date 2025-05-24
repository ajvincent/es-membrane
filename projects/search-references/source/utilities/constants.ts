// used in describing values
export enum ValueDiscrimant {
  NotApplicable = "NotApplicable",
  Object = "Object",
  Symbol = "Symbol",
  BigInt = "BigInt",
  Primitive = "Primitive",
}

//#region nodes
export enum BuiltInJSTypeName {
  Symbol = "Symbol",
  Object = "Object",
  Array = "Array",
  Function = "Function",
  AsyncFunction = "AsyncFunction",
  WeakRef = "WeakRef",
  WeakMap = "WeakMap",
  WeakSet = "WeakSet",
  Map = "Map",
  Set = "Set",
  Promise = "Promise",
  Proxy = "Proxy",
  FinalizationRegistry = "FinalizationRegistry",
  PrivateName = "#private",

  ArrayIterator = "ArrayIterator",
  MapIterator = "MapIterator",
  SetIterator = "SetIterator",
  Generator = "Generator",
  AsyncGenerator = "AsyncGenerator",
}

export enum NodePrefix {
  Object = "object",
  Symbol = "symbol",
  Target = "target",
  HeldValues = "heldValues",
  KeyValueTuple = "keyValueTuple",
  FinalizationTuple = "finalizationTuple",
  PrivateName = "privateName",
  PrivateFieldTuple = "privateFieldTuple",
};
//#endregion nodes

//#region edges
export enum ChildReferenceEdgeType {
  PropertyName = "PropertyName",
  ArrayIndex = "ArrayIndex",
  PropertySymbol = "PropertySymbol",
  SymbolKey = "SymbolKey",
  ScopeValue = "ScopeValue",
  InstanceOf = "InstanceOf",
  PrivateClassKey = "PrivateClassKey",
  PrivateClassValue = "PrivateClassValue",

  InternalSlot = "InternalSlot",

  SetElement = "SetElement",
  MapKey = "MapKey",
  MapValue = "MapValue",
}

export enum EdgePrefix {
  PropertyKey = "propertyKey",
  GetterKey = "getterKey",
  HasSymbolAsKey = "hasSymbolAsKey",
  InstanceOf = "instanceOf",
  ScopeValue = "scopeValue",
  InternalSlot = "internalSlot",
  MapToTuple = "mapToTuple",
  MapKey = "mapKey",
  MapKeyToTuple = "mapKeyToTuple",
  MapValue = "mapValue",
  SetValue = "setValue",
  FinalizationRegistryToTarget = "finalizationToTarget",
  FinalizationRegistryToTuple = "finalizationRegistryToTuple",
  FinalizationTargetToTuple = "finalizationTargetToTuple",
  FinalizationTupleToHeldValue = "finalizationTupleToHeldValue",
  FinalizationTupleToUnregisterToken = "finalizationTupleToUnregisterToken",
  ObjectToPrivateKey = "objectToPrivateKey",
  ObjectToPrivateTuple = "objectToPrivateTuple",
  PrivateKeyToTuple = "privateKeyToTuple",
  PrivateTupleToValue = "privateValue",
  PrivateTupleToGetter = "privateGetter",
};
//#endregion edges
