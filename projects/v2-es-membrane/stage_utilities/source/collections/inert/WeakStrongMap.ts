import type {
  WeakStrongMapIfc
} from "../types/WeakStrongMap.js";

export class InertWeakStrongMap<WeakKeyType extends object, StrongKeyType, ValueType>
implements WeakStrongMapIfc<WeakKeyType, StrongKeyType, ValueType>
{
  delete(weakKey: WeakKeyType, strongKey: StrongKeyType): boolean {
    void weakKey;
    void strongKey;
    return false;
  }
  get(weakKey: WeakKeyType, strongKey: StrongKeyType): ValueType | undefined {
    void weakKey;
    void strongKey;
    return undefined;
  }
  getOrInsertComputed(weakKey: WeakKeyType, strongKey: StrongKeyType, defaultGetter: () => ValueType): ValueType {
    void weakKey;
    void strongKey;
    void defaultGetter;
    throw new Error("Method not implemented.");
  }
  strongKeysFor(weakKey: WeakKeyType): Set<StrongKeyType> {
    void weakKey;
    return new Set();
  }
  has(weakKey: WeakKeyType, strongKey: StrongKeyType): boolean {
    void weakKey;
    void strongKey;
    return false;
  }
  set(weakKey: WeakKeyType, strongKey: StrongKeyType, value: ValueType): this {
    void weakKey;
    void strongKey;
    void value;
    return this;
  }
  revokeStrongKey(strongKey: StrongKeyType): void {
    void strongKey;
  }
  keyWasRevoked(strongKey: StrongKeyType): boolean {
    void strongKey;
    return true;
  }
}
