import {
  InertWeakMap
} from "./inert/WeakMap.js";

import {
  InertWeakStrongMap
} from "./inert/WeakStrongMap.js";

import type {
  OneToOneStrongMapIfc
} from "./types/OneToOneStrongMapIfc.js";

import type {
  WeakStrongMapIfc
} from "./types/WeakStrongMap.js";

import {
  WeakStrongMap
} from "./WeakStrongMap.js";

declare const WeakKeyBranding: unique symbol;
type PrivateKeyBranded = symbol & { [WeakKeyBranding]: "private" };
type SharedKeyBranded = symbol & { [WeakKeyBranding]: "shared" };

export class OneToOneStrongMap<StrongKeyType, ValueType extends WeakKey>
implements OneToOneStrongMapIfc<StrongKeyType, ValueType>
{
  static #symbolCounter: number = 0;
  static #getNextSymbol(type: "private" | "shared"): symbol {
    return Symbol(type + ":" + this.#symbolCounter++);
  }

  /* Here's the routing:
  1. When we bind values, `this.#valueToOwnStrongKeyMap.set(value, strongKey);`
  2. `const strongKey = this.#valueToOwnStrongKeyMap.get(value);`
    - a revoked strong key means we aren't holding any values coming from that key.
  3. `const privateKey = this.#incomingMap.get(value, strongKey)`.
  4. `const sharedKey = this.#privateKeyToSharedKeyMap.get(privateKey);`
  5. `return this.#outgoingMap.get(sharedKey, targetStrongKey, value);`
    - a revoked `targetStrongKey` means we aren't holding values going in to that key.

  Four maps to get a 1:1 value binding is annoying.  It used to be two:
    - (value => shared internal key) + target strong key => target value

  But this means we're inadvertently holding references from revoked values to live ones.
  */
  #valueToOwnStrongKeyMap: WeakMap<ValueType, StrongKeyType> = new WeakMap;
  #incomingMap: WeakStrongMapIfc<ValueType, StrongKeyType, PrivateKeyBranded> = new WeakStrongMap;
  #privateKeyToSharedKeyMap: WeakMap<PrivateKeyBranded, SharedKeyBranded> = new WeakMap;
  #outgoingMap: WeakStrongMapIfc<SharedKeyBranded, StrongKeyType, ValueType> = new WeakStrongMap;

  public bindOneToOne(
    strongKey_1: StrongKeyType,
    value_1: ValueType,
    strongKey_2: StrongKeyType,
    value_2: ValueType
  ) : void
  {
    if (this.#incomingMap.keyWasRevoked(strongKey_1))
      throw new Error("The first key was revoked!");
    if (this.#incomingMap.keyWasRevoked(strongKey_2))
      throw new Error("The second key was revoked!");

    if (!this.hasIdentity(value_1, strongKey_1, true))
      throw new Error("First strong key does not match the value!");
    if (!this.hasIdentity(value_2, strongKey_2, true))
      throw new Error("Second strong key does not match the value!");

    let sharedKey: SharedKeyBranded | undefined = this.#getSharedKey(value_1);
    const secondSharedKey: SharedKeyBranded | undefined = this.#getSharedKey(value_2);
    if (!sharedKey) {
      sharedKey = secondSharedKey || (OneToOneStrongMap.#getNextSymbol("shared") as SharedKeyBranded);
    }
    else if (secondSharedKey && (secondSharedKey !== sharedKey)) {
      return this.#attemptMergeKeys(sharedKey, secondSharedKey);
    }

    const __hasKeySet1__  = this.#outgoingMap.has(sharedKey, strongKey_1);
    const __hasKeySet2__  = this.#outgoingMap.has(sharedKey, strongKey_2);

    if (__hasKeySet1__ && (this.#outgoingMap.get(sharedKey, strongKey_1) !== value_1))
      throw new Error("value_1 mismatch!");
    if (__hasKeySet2__ && (this.#outgoingMap.get(sharedKey, strongKey_2) !== value_2))
      throw new Error("value_2 mismatch!");

    this.#setSharedKey(value_1, strongKey_1, sharedKey);
    this.#setSharedKey(value_2, strongKey_2, sharedKey);

    if (!__hasKeySet1__)
      this.#outgoingMap.set(sharedKey, strongKey_1, value_1);

    if (!__hasKeySet2__)
      this.#outgoingMap.set(sharedKey, strongKey_2, value_2);
  }


  #attemptMergeKeys(
    firstSharedKey: SharedKeyBranded,
    secondSharedKey: SharedKeyBranded
  ): void
  {
    const firstKeySet: ReadonlySet<StrongKeyType> = this.#outgoingMap.strongKeysFor(firstSharedKey);
    const secondKeySet: ReadonlySet<StrongKeyType> = this.#outgoingMap.strongKeysFor(secondSharedKey);

    const unionKeySet: ReadonlySet<StrongKeyType> = firstKeySet.union(secondKeySet);
    if (unionKeySet.size < firstKeySet.size + secondKeySet.size)
      throw new Error("value_1 and value_2 have conflicting keys!");

    for (const strongKey of secondKeySet) {
      const secondValue: ValueType = this.#outgoingMap.get(secondSharedKey, strongKey)!;
      this.#outgoingMap.set(firstSharedKey, strongKey, secondValue);
      this.#outgoingMap.delete(secondSharedKey, strongKey);

      const privateKey: PrivateKeyBranded = this.#incomingMap.get(secondValue, strongKey)!;
      this.#privateKeyToSharedKeyMap.set(privateKey, firstSharedKey);
    }
  }

  #getSharedKey(value: ValueType): SharedKeyBranded | undefined {
    const strongKey = this.#valueToOwnStrongKeyMap.get(value);
    if (!strongKey)
      return undefined;
    const privateKey = this.#incomingMap.get(value, strongKey);
    if (!privateKey)
      return undefined;
    return this.#privateKeyToSharedKeyMap.get(privateKey);
  }

  #setSharedKey(value: ValueType, strongKey: StrongKeyType, sharedKey: SharedKeyBranded): void {
    this.#valueToOwnStrongKeyMap.set(value, strongKey);
    const privateKey = this.#incomingMap.getOrInsertComputed(
      value, strongKey, () => OneToOneStrongMap.#getNextSymbol("private") as PrivateKeyBranded
    );
    this.#privateKeyToSharedKeyMap.set(privateKey, sharedKey);
    this.#outgoingMap.set(sharedKey, strongKey, value);
  }

  public clear(): void {
    this.#valueToOwnStrongKeyMap = new WeakMap;
    this.#incomingMap = new WeakStrongMap;
    this.#privateKeyToSharedKeyMap = new WeakMap;
    this.#outgoingMap = new WeakStrongMap;
  }

  public delete(
    value: ValueType,
    strongKey: StrongKeyType
  ) : boolean
  {
    const sharedKey = this.#getSharedKey(value);
    if (!sharedKey)
      return false;

    const __target__: ValueType | undefined = this.#outgoingMap.get(sharedKey, strongKey);
    if (!__target__)
      return false;

    this.#deleteValue(__target__);
    const remainingKeys: ReadonlySet<StrongKeyType> = this.#outgoingMap.strongKeysFor(sharedKey);
    if (remainingKeys.size < 2) {
      for (const strongKey of remainingKeys) {
        const otherTarget: ValueType = this.#outgoingMap.get(sharedKey, strongKey)!;
        this.#deleteValue(otherTarget);
      }
    }

    return true;
  }

  #deleteValue(value: ValueType): void {
    const strongKey: StrongKeyType = this.#valueToOwnStrongKeyMap.get(value)!;
    const privateKey: PrivateKeyBranded = this.#incomingMap.get(value, strongKey)!;
    const sharedKey: SharedKeyBranded = this.#privateKeyToSharedKeyMap.get(privateKey)!;

    this.#outgoingMap.delete(sharedKey, strongKey);
    this.#incomingMap.delete(value, strongKey);
    this.#valueToOwnStrongKeyMap.delete(value);
  }

  public get(
    value: ValueType,
    strongKey: StrongKeyType
  ) : ValueType | undefined
  {
    const weakKey = this.#getSharedKey(value);
    return weakKey ? this.#outgoingMap.get(weakKey, strongKey) : undefined;
  }

  public has(
    value: ValueType,
    strongKey: StrongKeyType
  ) : boolean
  {
    const weakKey = this.#getSharedKey(value);
    return weakKey ? this.#outgoingMap.has(weakKey, strongKey) : false;
  }

  public hasIdentity(
    value: ValueType,
    strongKey: StrongKeyType,
    allowNotDefined: boolean
  ) : boolean
  {
    if (!this.#valueToOwnStrongKeyMap.has(value))
      return allowNotDefined;

    return this.#valueToOwnStrongKeyMap.get(value) === strongKey;
  }

  public readonly [Symbol.toStringTag] = "OneToOneStrongMap";

  public keyWasRevoked(strongKey: StrongKeyType): boolean {
    return this.#outgoingMap.keyWasRevoked(strongKey);
  }

  public revokeStrongKey(strongKey: StrongKeyType): void {
    this.#incomingMap.revokeStrongKey(strongKey);
    this.#outgoingMap.revokeStrongKey(strongKey);
  }

  public revokeEverything(): void {
    this.#valueToOwnStrongKeyMap = new InertWeakMap;
    this.#incomingMap = new InertWeakStrongMap;
    this.#privateKeyToSharedKeyMap = new InertWeakMap;
    this.#outgoingMap = new InertWeakStrongMap;
  }
}

Object.freeze(OneToOneStrongMap);
Object.freeze(OneToOneStrongMap.prototype);
