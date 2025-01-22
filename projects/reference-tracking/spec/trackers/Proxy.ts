import type {
  ReadonlyDeep
} from "type-fest";

import {
  ProxyTracking
} from "../../source/trackers/Proxy.js";

import {
  SpecialReferences
} from "../../source/trackers/SpecialReferences.js";

import {
  COLLECT_REFERENCES,
  type ReferenceDescriptionGetter,
  type ReferenceDescription,
} from "../../source/trackers/utilities/ReferenceDescription.js";

describe("ProxyTracking creates proxies and exposes slots via SpecialReferences", () => {
  const proxyTarget = {
    color: "red"
  };

  const MirrorHandler: Required<ProxyHandler<typeof proxyTarget>> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apply: function (target: { color: string; }, thisArg: any, argArray: any[]) {
      void(target);
      void(thisArg);
      void(argArray);
      throw new Error("apply() not implemented.");
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-explicit-any
    construct: function (target: { color: string; }, argArray: any[], newTarget: Function): object {
      void(target);
      void(argArray);
      void(newTarget);
      throw new Error("construct() not implemented.");
    },
    defineProperty: function (target: { color: string; }, property: string | symbol, attributes: PropertyDescriptor): boolean {
      return Reflect.defineProperty(target, property, attributes);
    },
    deleteProperty: function (target: { color: string; }, p: string | symbol): boolean {
      return Reflect.deleteProperty(target, p);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: function (target: { color: string; }, p: string | symbol, receiver: any) {
      return Reflect.get(target, p, receiver);
    },
    getOwnPropertyDescriptor: function (target: { color: string; }, p: string | symbol): PropertyDescriptor | undefined {
      return Reflect.getOwnPropertyDescriptor(target, p);
    },
    getPrototypeOf: function (target: { color: string; }): object | null {
      return Reflect.getPrototypeOf(target); // Jasmine trips over this
    },
    has: function (target: { color: string; }, p: string | symbol): boolean {
      return Reflect.has(target, p);
    },
    isExtensible: function (target: { color: string; }): boolean {
      return Reflect.isExtensible(target);
    },
    ownKeys: function (target: { color: string; }): ArrayLike<string | symbol> {
      return Reflect.ownKeys(target);
    },
    preventExtensions: function (target: { color: string; }): boolean {
      return Reflect.preventExtensions(target);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: function (target: { color: string; }, p: string | symbol, newValue: any, receiver: any): boolean {
      return Reflect.set(target, p, newValue, receiver);

    },
    setPrototypeOf: function (target: { color: string; }, v: object | null): boolean {
      return Reflect.setPrototypeOf(target, v);
    }
  };

  it("when used as a constructor", () => {
    const proxy = new ProxyTracking(proxyTarget, MirrorHandler);

    {
      const proxyCollector: ReferenceDescriptionGetter | undefined = SpecialReferences.get(proxy);
      expect(proxyCollector).toBeTruthy();
      if (!proxyCollector)
        return;

      const proxyRefs: ReadonlyDeep<ReferenceDescription[]> = proxyCollector[COLLECT_REFERENCES]();
      expect(proxyRefs.length).toBe(2);
      if (proxyRefs.length !== 2)
        return;
      const [firstRef, secondRef] = proxyRefs;
      expect(firstRef.collectionName).toBe("Proxy");
      expect(firstRef.jointOwners.size).toBe(1);
      expect(firstRef.jointOwners.has(proxy)).toBeTrue();
      expect(firstRef.referencedValue).toBe(proxyTarget);
      expect(firstRef.isStrongReference).toBeTrue();
      expect(firstRef.contextPrimitives).toEqual([
        "[[ProxyTarget]]"
      ]);

      expect(secondRef.collectionName).toBe("Proxy");
      expect(secondRef.jointOwners.size).toBe(1);
      expect(secondRef.jointOwners.has(proxy)).toBeTrue();
      expect(secondRef.referencedValue).toBe(MirrorHandler);
      expect(secondRef.isStrongReference).toBe(true);
      expect(secondRef.contextPrimitives).toEqual([
        "[[ProxyHandler]]"
      ]);
    }
  });

  it("when invoking .revocable()", () => {
    const { proxy, revoke } = ProxyTracking.revocable(proxyTarget, MirrorHandler);

    {
      const proxyCollector: ReferenceDescriptionGetter | undefined = SpecialReferences.get(proxy);
      expect(proxyCollector).toBeTruthy();
      if (!proxyCollector)
        return;

      const proxyRefs: ReadonlyDeep<ReferenceDescription[]> = proxyCollector[COLLECT_REFERENCES]();
      expect(proxyRefs.length).toBe(2);
      if (proxyRefs.length !== 2)
        return;
      const [firstRef, secondRef] = proxyRefs;
      expect(firstRef.collectionName).toBe("Proxy");
      expect(firstRef.jointOwners.size).toBe(1);
      expect(firstRef.jointOwners.has(proxy)).toBeTrue();
      expect(firstRef.referencedValue).toBe(proxyTarget);
      expect(firstRef.isStrongReference).toBeTrue();
      expect(firstRef.contextPrimitives).toEqual([
        "[[ProxyTarget]]"
      ]);

      expect(secondRef.collectionName).toBe("Proxy");
      expect(secondRef.jointOwners.size).toBe(1);
      expect(secondRef.jointOwners.has(proxy)).toBeTrue();
      expect(secondRef.referencedValue).toBe(MirrorHandler);
      expect(secondRef.isStrongReference).toBe(true);
      expect(secondRef.contextPrimitives).toEqual([
        "[[ProxyHandler]]"
      ]);
    }

    {
      const revokeCollector: ReferenceDescriptionGetter | undefined = SpecialReferences.get(revoke);
      expect(revokeCollector).toBeTruthy();
      if (!revokeCollector)
        return;

      const revokeRefs: ReadonlyDeep<ReferenceDescription[]> = revokeCollector[COLLECT_REFERENCES]();
      expect(revokeRefs.length).toBe(1);
      if (revokeRefs.length !== 1)
        return;

      const revokeToProxyRef = revokeRefs[0];
      expect(revokeToProxyRef.collectionName).toBe("Proxy.revocable");
      expect(revokeToProxyRef.jointOwners.size).toBe(1);
      expect(revokeToProxyRef.jointOwners.has(revoke)).toBeTrue();
      expect(revokeToProxyRef.referencedValue).toBe(proxy);
      expect(revokeToProxyRef.isStrongReference).toBeTrue();
      expect(revokeToProxyRef.contextPrimitives).toEqual([
        "[[RevocableProxy]]"
      ]);
    }

    revoke(); // ensure we don't report the slots after revocation
    {
      const revokeCollector: ReferenceDescriptionGetter | undefined = SpecialReferences.get(revoke);
      expect(revokeCollector).toBeTruthy();
      if (!revokeCollector)
        return;

      const revokeRefs: ReadonlyDeep<ReferenceDescription[]> = revokeCollector[COLLECT_REFERENCES]();
      expect(revokeRefs.length).toBe(0);
    }

    // yes, we really did revoke the proxy.
    expect(() => void(proxy.color)).toThrow();
  });
});
