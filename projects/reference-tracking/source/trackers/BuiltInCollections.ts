import type {
  CollectionsIfc
} from "./types/CollectionsIfc.js";

export const BuiltInCollections: CollectionsIfc = {
  Array: globalThis.Array,

  WeakMap: globalThis.WeakMap,
  WeakSet: globalThis.WeakSet,

  Map: globalThis.Map,
  Set: globalThis.Set,

  Proxy: globalThis.Proxy,

  WeakRef: globalThis.WeakRef,
  FinalizationRegistry: globalThis.FinalizationRegistry,

  install: function(): void {
    globalThis.Array = this.Array;

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
