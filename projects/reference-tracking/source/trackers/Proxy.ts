import type{
  ReadonlyDeep,
} from "type-fest";

import {
  BuiltInCollections
} from "./BuiltInCollections.js";

import {
  SpecialReferences
} from "./SpecialReferences.js";

import {
  COLLECT_REFERENCES,
  ReferenceDescription,
  ReferenceDescriptionGetter,
  ReferenceDescriptionIfc,
} from "./utilities/ReferenceDescription.js";

import type {
  ProxyRevocableReturn
} from "../types/ProxyRevocableReturn.js";

export class ProxySlots
implements ReferenceDescriptionGetter
{
  #proxyRef: WeakRef<object>;
  #targetRef: WeakRef<object>;
  #handlerRef: WeakRef<ProxyHandler<object>>;

  constructor(proxy: object, target: object, handler: ProxyHandler<object>) {
    this.#proxyRef = new BuiltInCollections.WeakRef(proxy);
    this.#targetRef = new BuiltInCollections.WeakRef(target);
    this.#handlerRef = new BuiltInCollections.WeakRef(handler);
  }

  public [COLLECT_REFERENCES](): ReadonlyDeep<ReferenceDescriptionIfc[]> {
    const refs: ReferenceDescription[] = [];

    const proxy = this.#proxyRef.deref();
    const target = this.#targetRef.deref();
    const handler = this.#handlerRef.deref();
    if (proxy && target && handler) {
      refs.push(new ReferenceDescription("Proxy", [proxy], target, true, ["[[ProxyTarget]]"]));
      refs.push(new ReferenceDescription("Proxy", [proxy], handler, true, ["[[ProxyHandler]]"]));
    }

    return refs;
  }
}

export class RevokerSlots<T extends object> {
  #proxyRef: WeakRef<T> | undefined;
  #revokeRef: WeakRef<() => void> | undefined;

  public constructor(proxyAndRevoke: ProxyRevocableReturn<T>) {
    this.#proxyRef = new BuiltInCollections.WeakRef(proxyAndRevoke.proxy);
    const revoke = this.#buildRevoker(proxyAndRevoke.revoke);
    this.#revokeRef = new BuiltInCollections.WeakRef(revoke);
    proxyAndRevoke.revoke = revoke;
  }

  #buildRevoker(existingRevoke: () => void): (() => void) {
    return () => {
      this.#revokeRef = undefined;
      this.#proxyRef = undefined;
      existingRevoke();
    };
  }

  public [COLLECT_REFERENCES](): ReadonlyDeep<ReferenceDescriptionIfc[]> {
    const refs: ReferenceDescription[] = [];
    const proxy = this.#proxyRef?.deref();
    const revoke = this.#revokeRef?.deref();
    if (proxy && revoke) {
      refs.push(new ReferenceDescription("Proxy.revocable", [revoke], proxy, true, ["[[RevocableProxy]]"]));
    }
    return refs;
  }
}

function ProxyTrackingInternal<T extends object>(
  target: T,
  handler: ProxyHandler<T>
): T
{
  if (!new.target)
    throw new Error("call this function with the new operator");

  // This line requires installing the new collections.
  const proxy = new BuiltInCollections.Proxy<T>(target, handler);
  SpecialReferences.set(proxy, new ProxySlots(proxy, target, handler));
  return proxy;
}

ProxyTrackingInternal.revocable = function<T extends object>(
  target: T,
  handler: ProxyHandler<T>
): ProxyRevocableReturn<T>
{
  const proxyAndRevoke = BuiltInCollections.Proxy.revocable(target, handler);
  SpecialReferences.set(proxyAndRevoke.proxy, new ProxySlots(proxyAndRevoke.proxy, target, handler));

  // replaces proxyAndRevoke.revoke
  const revokerSlots = new RevokerSlots<T>(proxyAndRevoke);

  SpecialReferences.set(proxyAndRevoke.revoke, revokerSlots);
  return proxyAndRevoke;
}

export const ProxyTracking = ProxyTrackingInternal as unknown as ProxyConstructor;
