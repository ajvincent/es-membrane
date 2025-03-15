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
  WeakRef = "WeakRef",
  WeakMap = "WeakMap",
  WeakSet = "WeakSet",
  Map = "Map",
  Set = "Set",
  Proxy = "Proxy",
  FinalizationRegistry = "FinalizationRegistry",
  PrivateName = "#private",
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
  InternalSlot = "internalSlot",
  MapToTuple = "mapToTuple",
  MapKey = "mapKey",
  MapValue = "mapValue",
  SetValue = "setValue",
  FinalizationRegistryToTuple = "finalizationToTuple",
  FinalizationToTarget = "finalizationToTarget",
  FinalizationToHeldValue = "finalizationToHeldValue",
  FinalizationToUnregisterToken = "finalizationToUnregisterToken",
  ObjectToPrivateTuple = "privateTuple",
  PrivateTupleToKey = "privateKey",
  PrivateTupleToValue = "privateValue",
  PrivateTupleToGetter = "privateGetter",
};
//#endregion edges
