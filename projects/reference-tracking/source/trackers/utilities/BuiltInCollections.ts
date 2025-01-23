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

  install: function(): void {
    globalThis.WeakMap = this.WeakMap;
    globalThis.WeakSet = this.WeakSet;

    globalThis.Map = this.Map;
    globalThis.Set = this.Set;

    globalThis.Proxy = this.Proxy;

    globalThis.WeakRef = this.WeakRef;
    globalThis.FinalizationRegistry = this.FinalizationRegistry;
  }
}
Object.freeze(BuiltInCollections);
