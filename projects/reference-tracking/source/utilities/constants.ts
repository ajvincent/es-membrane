export enum ChildReferenceEdgeType {
  PropertyName = "PropertyName",
  ArrayIndex = "ArrayIndex",
  PropertySymbol = "PropertySymbol",
  PrivateClassField = "PrivateClassField",

  InternalSlot = "InternalSlot",

  SetElement = "SetElement",
  MapKey = "MapKey",
  MapValue = "MapValue",

  // less sure of these
  FunctionClosure = "FunctionClosure",
  BoundFunction = "BoundFunction",

  // shortcut: foo.bar.baz[0] = wop;
  PropertySequence = "PropertySequence",
}

export enum BuiltInJSTypeName {
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
}

export enum ValueDiscrimant {
  NotApplicable = "NotApplicable",
  Object = "Object",
  Symbol = "Symbol",
  BigInt = "BigInt",
  Primitive = "Primitive",
}

export enum NodePrefix {
  Object = "object",
  Target = "target",
  HeldValues = "heldValues",
  KeyValueTuple = "keyValueTuple"
};

export enum EdgePrefix {
  PropertyKey = "propertyKey",
  InternalSlot = "internalSlot",
  MapToTuple = "mapToTuple",
  MapKey = "mapKey",
  MapValue = "mapValue",
  SetValue = "setValue"
};
