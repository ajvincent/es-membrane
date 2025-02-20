export enum ChildReferenceEdgeType {
  PropertyName = "PropertyName",
  ArrayIndex = "ArrayIndex",
  PropertySymbol = "PropertySymbol",
  PrivateClassField = "PrivateClassField",

  InternalSlot = "InternalSlot",

  // less sure of these
  FunctionClosure = "FunctionClosure",
  BoundFunction = "BoundFunction",

  // shortcut: foo.bar.baz[0] = wop;
  PropertySequence = "PropertySequence"
}

export const TARGET_NODE_KEY = 0;
export const PRESUMED_HELD_NODE_KEY = 1;

export enum BuiltInCollectionName {
  Object = "Object",
  Array = "Array",
  Function = "Function",
  WeakRef = "WeakRef",
  WeakMap = "WeakMap",
  WeakSet = "WeakSet",
  Map = "Map",
  Set = "Set",
  Proxy = "Proxy",
  FinalizationRegistry = "FinalizationRegistry"
}
