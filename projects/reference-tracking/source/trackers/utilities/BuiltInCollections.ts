import type {
  CollectionsIfc
} from "../types/CollectionsIfc.js";

export const BuiltInCollections: CollectionsIfc = {
  WeakMap: globalThis.WeakMap,
  WeakSet: globalThis.WeakSet,

  Map: globalThis.Map,
  Set: globalThis.Set,

  Proxy: globalThis.Proxy,

  WeakRef: globalThis.WeakRef,
  FinalizationRegistry: globalThis.FinalizationRegistry,

  Promise: globalThis.Promise,
}
Object.freeze(BuiltInCollections);
