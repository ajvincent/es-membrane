/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  Class
} from "type-fest";

import {
  defineKeyedSlot,
  defineValueSlot
} from "./classSlotDecorators.js";

import {
  clearObjectSlotIfExists,
  clearReferenceIfExists,
  defineReference,
  flushReferences,
  noReferenceChangesToThis,
  returnsConstructed,
} from "./methodDecorators.js";

import {
  ReferenceDefinitions
} from "./ReferenceDefinitions.js";

interface ProxyRevocableReturn<T extends object> {
  proxy: T;
  revoke: () => void;
}

// "The class decorator is called only after all method and field decorators are called and applied."
// https://github.com/tc39/proposal-decorators?tab=readme-ov-file#3-applying-decorators

const BuiltInClassReferences: ReadonlyMap<string, Class<object>> = new Map<string, Class<object>>([
  ["[[Proxy.revocable:[returnType]]]",
    class<T extends object> extends ReferenceDefinitions implements ProxyRevocableReturn<T> {
      #revoker: () => void;

      constructor(proxy: T, revoker: () => void) {
        super();
        this.proxy = proxy;
        this.#revoker = revoker;
        throw new Error("Constructor not implemented.");
      }

      proxy: T

      @clearObjectSlotIfExists("proxy", "[[ProxyTarget]]")
      @clearObjectSlotIfExists("proxy", "[[ProxyHandler]]")
      @clearReferenceIfExists(["proxy"])
      @clearReferenceIfExists(["#revoker"])
      revoke() {
        this.#revoker();
      };
    }
  ],

  ["FinalizationRegistry", class<T> extends ReferenceDefinitions implements FinalizationRegistry<T> {
    register(target: WeakKey, heldValue: T, unregisterToken?: WeakKey): void {
      throw new Error("Method not implemented.");
    }
    unregister(unregisterToken: WeakKey): boolean {
      throw new Error("Method not implemented.");
    }
    get [Symbol.toStringTag](): "FinalizationRegistry" {
      throw new Error("Getter not implemented.");
    }
  }],

  ["Map",
    @defineKeyedSlot("[[MapData]]", true, "iterable")
    class<K extends WeakKey, V> extends ReferenceDefinitions implements Map<K, V> {
      @flushReferences("[[MapData]]")
      clear(): void {
        throw new Error("Method not implemented.");
      }

      @clearReferenceIfExists(["[[MapData]]", "key"])
      delete(key: K): boolean {
        throw new Error("Method not implemented.");
      }

      @noReferenceChangesToThis
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        throw new Error("Method not implemented.");
      }

      @noReferenceChangesToThis
      get(key: K): V | undefined {
        throw new Error("Method not implemented.");
      }

      @noReferenceChangesToThis
      has(key: K): boolean {
        throw new Error("Method not implemented.");
      }

      @defineReference(["[[MapData]]", "key"], "value", true)
      set(key: K, value: V): this {
        throw new Error("Method not implemented.");
      }
      get size(): number {
        throw new Error("Getter not implemented.");
      };

      @noReferenceChangesToThis
      entries(): MapIterator<[K, V]> {
        throw new Error("Method not implemented.");
      }

      @noReferenceChangesToThis
      keys(): MapIterator<K> {
        throw new Error("Method not implemented.");
      }

      @noReferenceChangesToThis
      values(): MapIterator<V> {
        throw new Error("Method not implemented.");
      }

      @noReferenceChangesToThis
      [Symbol.iterator](): MapIterator<[K, V]> {
        throw new Error("Method not implemented.");
      }
      get [Symbol.toStringTag](): string {
        throw new Error("Getter not implemented.")
      };
    }
  ],

  /** Proxies are a little different: the revoker slot can hold a reference to the proxy after the proxy would otherwise be lost. */
  ["Proxy",

    @defineValueSlot("[[ProxyTarget]]", "target")
    @defineValueSlot("[[ProxyHandler]]", "handler")
    class <T extends object> extends ReferenceDefinitions {
      constructor(target: T, handler: ProxyHandler<T>) {
        super();
        throw new Error("Class constructor not implemented.");
      }

      @returnsConstructed("[[Proxy.revocable:[returnType]]]", ["target", "revoker"])
      static revocable<T extends object>(target: T, handler: ProxyHandler<T>): ProxyRevocableReturn<T> {
        const revoker: () => void = function() {
          throw new Error("not implemented");
        }
        throw new Error("Static method not implemented.")
      }
    }
  ],

  ["Set",

    @defineKeyedSlot("[[SetData]]", true, "iterable")
    class<T> extends ReferenceDefinitions implements Set<T> {
      @defineReference(["[[SetData]]"], "value", true)
      add(value: T): this {
        throw new Error("Method not implemented.");
      }

      @flushReferences("[[SetData]]")
      clear(): void {
        throw new Error("Method not implemented.");
      }

      @clearReferenceIfExists(["[[SetData]]"])
      delete(value: T): boolean {
        throw new Error("Method not implemented.");
      }

      @noReferenceChangesToThis
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
        throw new Error("Method not implemented.");
      }

      @noReferenceChangesToThis
      has(value: T): boolean {
        throw new Error("Method not implemented.");
      }

      get size(): number {
        throw new Error("Getter not implemented.");
      }

      @noReferenceChangesToThis
      entries(): SetIterator<[T, T]> {
        throw new Error("Method not implemented.");
      }

      @noReferenceChangesToThis
      keys(): SetIterator<T> {
        throw new Error("Method not implemented.");
      }

      @noReferenceChangesToThis
      values(): SetIterator<T> {
        throw new Error("Method not implemented.");
      }

      @noReferenceChangesToThis
      [Symbol.iterator](): SetIterator<T> {
        throw new Error("Method not implemented.");
      }
      get [Symbol.toStringTag](): string {
        throw new Error("Getter not implemented.")
      };
    }
  ],

  ["WeakMap",

    @defineKeyedSlot("[[WeakMapData]]", false, "iterable")
    class<K extends WeakKey, V> extends ReferenceDefinitions implements WeakMap<K, V> {
      @clearReferenceIfExists(["[[WeakMapData]]", "key"])
      delete(key: K): boolean {
        throw new Error("Method not implemented.");
      }

      @noReferenceChangesToThis
      get(key: K): V | undefined {
        throw new Error("Method not implemented.");
      }

      @noReferenceChangesToThis
      has(key: K): boolean {
        throw new Error("Method not implemented.");
      }

      @defineReference(["[[WeakMapData]]", "key"], "value", false)
      set(key: K, value: V): this {
        throw new Error("Method not implemented.");
      }

      get [Symbol.toStringTag](): string {
        throw new Error("Getter not implemented.")
      };
    }
  ],

  ["WeakRef",

    @defineValueSlot("[[WeakRefTarget]]", "target")
    class<T extends WeakKey> extends ReferenceDefinitions implements WeakRef<T> {
      constructor(target: T) {
        super();
        throw new Error("Constructor not implemented.");
      }

      @noReferenceChangesToThis
      deref(): T | undefined {
        throw new Error("Method not implemented.");
      }
      get [Symbol.toStringTag](): "WeakRef" {
        throw new Error("Getter not implemented.");
      }
    }
  ],

  ["WeakSet",

    @defineKeyedSlot("[[WeakSetData]]", false, "iterable")
    class<T extends WeakKey> extends ReferenceDefinitions implements WeakSet<T> {

      @defineReference(["[[WeakSetData]]"], "value", false)
      add(value: T): this {
        throw new Error("Method not implemented.");
      }

      @clearReferenceIfExists(["[[WeakSetData]]", "value"])
      delete(value: T): boolean {
        throw new Error("Method not implemented.");
      }

      @noReferenceChangesToThis
      has(value: T): boolean {
        throw new Error("Method not implemented.");
      }

      get [Symbol.toStringTag](): string {
        throw new Error("Getter not implemented.")
      };
    }
  ],
]);
export default BuiltInClassReferences;
