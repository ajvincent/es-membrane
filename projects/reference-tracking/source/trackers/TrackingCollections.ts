import type {
  CollectionsIfc
} from "./types/CollectionsIfc.js";

import {
  FinalizationRegistryTracking
} from "./FinalizationRegistry.js";

import {
  MapTracking
} from "./Map.js";

import {
  ProxyTracking
} from "./Proxy.js";

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
  WeakMap: WeakMapTracking,
  WeakSet: WeakSetTracking,

  Map: MapTracking,
  Set: SetTracking,

  Proxy: ProxyTracking,

  WeakRef: WeakRefTracking,
  FinalizationRegistry: FinalizationRegistryTracking,

  Promise: globalThis.Promise,

  install: function(): void {
    globalThis.WeakMap = this.WeakMap;
    globalThis.WeakSet = this.WeakSet;

    globalThis.Map = this.Map;
    globalThis.Set = this.Set;

    globalThis.Proxy = this.Proxy;

    globalThis.WeakRef = this.WeakRef;
    globalThis.FinalizationRegistry = this.FinalizationRegistry;

    globalThis.Promise = this.Promise;
  }
};
Object.freeze(TrackingCollections);
