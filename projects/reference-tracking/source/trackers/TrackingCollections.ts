import type {
  CollectionsIfc
} from "./types/CollectionsIfc.js";

import {
  MapTracking
} from "./Map.js";

import {
  SetTracking
} from "./Set.js";

import {
  WeakMapTracking
} from "./WeakMap.js";

import {
  WeakRefTracking
} from "./WeakRef.js";

import {
  WeakSetTracking
} from "./WeakSet.js";

export const TrackingCollections: CollectionsIfc = {
  Array: globalThis.Array,

  WeakMap: WeakMapTracking,
  WeakSet: WeakSetTracking,

  Map: MapTracking,
  Set: SetTracking,

  Proxy: globalThis.Proxy,
  Proxy_revocable: globalThis.Proxy.revocable,

  WeakRef: WeakRefTracking,
  FinalizationRegistry: globalThis.FinalizationRegistry,

  install: function(): void {
    globalThis.Array = this.Array;

    globalThis.WeakMap = this.WeakMap;
    globalThis.WeakSet = this.WeakSet;

    globalThis.Map = this.Map;
    globalThis.Set = this.Set;

    globalThis.Proxy = this.Proxy;
    globalThis.Proxy.revocable = this.Proxy_revocable;

    globalThis.WeakRef = this.WeakRef;
    globalThis.FinalizationRegistry = this.FinalizationRegistry;
  }
};
Object.freeze(TrackingCollections);
