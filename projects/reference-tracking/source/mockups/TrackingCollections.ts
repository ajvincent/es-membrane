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
  PrivateClassPropertiesMap,
  type PrivateClassFieldTools,
  TrackPrivateStaticFields,
  TrackPrivateFields,
  TrackedPrivateReferences,
} from "./PrivateClassProperties.js";

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

export const TrackingCollections: CollectionsIfc & PrivateClassFieldTools = {
  WeakMap: WeakMapTracking,
  WeakSet: WeakSetTracking,

  Map: MapTracking,
  Set: SetTracking,

  Proxy: ProxyTracking,

  WeakRef: WeakRefTracking,
  FinalizationRegistry: FinalizationRegistryTracking,

  Promise: globalThis.Promise,

  PrivateClassPropertiesMap,
  TrackedPrivateReferences,
  TrackPrivateStaticFields,
  TrackPrivateFields,
};
Object.freeze(TrackingCollections);
