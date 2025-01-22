export type CollectionsIfc = {
  WeakSet: WeakSetConstructor,
  WeakMap: WeakMapConstructor,

  Map: MapConstructor
  Set: SetConstructor,

  Proxy: ProxyConstructor,

  WeakRef: WeakRefConstructor,
  FinalizationRegistry: FinalizationRegistryConstructor,

  install(): void;
}
