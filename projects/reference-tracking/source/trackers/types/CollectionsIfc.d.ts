export type CollectionsIfc = {
  Array: ArrayConstructor,

  WeakSet: WeakSetConstructor,
  WeakMap: WeakMapConstructor,

  Map: MapConstructor
  Set: SetConstructor,

  Proxy: ProxyConstructor,
  Proxy_revocable: typeof globalThis.Proxy.revocable,

  WeakRef: WeakRefConstructor,
  FinalizationRegistry: FinalizationRegistryConstructor,

  install(): void;
}
