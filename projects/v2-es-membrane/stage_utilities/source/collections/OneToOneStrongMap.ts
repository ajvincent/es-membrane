import type {
  WeakKeyBranded,
  PrivateKeyBranded,
  SharedKeyBranded
} from "./KeysBranded.js";

import {
  type OneToOneInternalsIfc,
  OneToOneInternalsLive,
  OneToOneInternalsInert,
} from "./OneToOneInternals.js";

import {
  MinRefCountTracker
} from "./MinRefCountTracker.js";

import {
  InertMinRefCountTracker,
} from "./inert/MinRefCountTracker.js";

import type {
  MinRefCountTrackerIfc,
} from "./types/MinRefCountTrackerIfc.js";

import type {
  OneToOneStrongMapIfc
} from "./types/OneToOneStrongMapIfc.js";

export class OneToOneStrongMap<StrongKeyType, ValueType extends WeakKey>
implements OneToOneStrongMapIfc<StrongKeyType, ValueType>
{
  static #symbolCounter: number = 0;
  static #getNextSymbol<
    Brand extends "private" | "shared"
  >
  (
    type: Brand
  ): WeakKeyBranded<Brand>
  {
    return Symbol(type + ":" + this.#symbolCounter++) as WeakKeyBranded<Brand>;
  }

  #internals: OneToOneInternalsIfc<StrongKeyType, ValueType> = new OneToOneInternalsLive();
  #refCountTracker: MinRefCountTrackerIfc<StrongKeyType> = new MinRefCountTracker(
    2, this.#deleteRemainingKeys.bind(this)
  );

  public bindOneToOne(
    strongKey_1: StrongKeyType,
    value_1: ValueType,
    strongKey_2: StrongKeyType,
    value_2: ValueType
  ) : void
  {
    if (this.#internals.incomingMap.keyWasRevoked(strongKey_1))
      throw new Error("The first key was revoked!");
    if (this.#internals.incomingMap.keyWasRevoked(strongKey_2))
      throw new Error("The second key was revoked!");

    if (!this.hasIdentity(value_1, strongKey_1, true))
      throw new Error("First strong key does not match the value!");
    if (!this.hasIdentity(value_2, strongKey_2, true))
      throw new Error("Second strong key does not match the value!");

    let sharedKey: SharedKeyBranded | undefined = this.#getSharedKey(value_1);
    const secondSharedKey: SharedKeyBranded | undefined = this.#getSharedKey(value_2);
    if (!sharedKey) {
      sharedKey = secondSharedKey ?? OneToOneStrongMap.#getNextSymbol("shared");
    }
    else if (secondSharedKey && (secondSharedKey !== sharedKey)) {
      return this.#attemptMergeKeys(sharedKey, secondSharedKey);
    }

    const __hasKeySet1__  = this.#internals.outgoingMap.has(sharedKey, strongKey_1);
    const __hasKeySet2__  = this.#internals.outgoingMap.has(sharedKey, strongKey_2);

    if (__hasKeySet1__ && (this.#internals.outgoingMap.get(sharedKey, strongKey_1) !== value_1))
      throw new Error("value_1 mismatch!");
    if (__hasKeySet2__ && (this.#internals.outgoingMap.get(sharedKey, strongKey_2) !== value_2))
      throw new Error("value_2 mismatch!");

    this.#setSharedKey(value_1, strongKey_1, sharedKey);
    this.#setSharedKey(value_2, strongKey_2, sharedKey);

    if (!__hasKeySet1__)
      this.#internals.outgoingMap.set(sharedKey, strongKey_1, value_1);

    if (!__hasKeySet2__)
      this.#internals.outgoingMap.set(sharedKey, strongKey_2, value_2);
  }

  #attemptMergeKeys(
    firstSharedKey: SharedKeyBranded,
    secondSharedKey: SharedKeyBranded
  ): void
  {
    const firstKeySet: ReadonlySet<StrongKeyType> = this.#internals.outgoingMap.strongKeysFor(firstSharedKey);
    const secondKeySet: ReadonlySet<StrongKeyType> = this.#internals.outgoingMap.strongKeysFor(secondSharedKey);

    const unionKeySet: ReadonlySet<StrongKeyType> = firstKeySet.union(secondKeySet);
    if (unionKeySet.size < firstKeySet.size + secondKeySet.size)
      throw new Error("value_1 and value_2 have conflicting keys!");

    for (const strongKey of secondKeySet) {
      const secondValue: ValueType = this.#internals.outgoingMap.get(secondSharedKey, strongKey)!;
      this.#internals.outgoingMap.set(firstSharedKey, strongKey, secondValue);
      this.#internals.outgoingMap.delete(secondSharedKey, strongKey);

      const privateKey: PrivateKeyBranded = this.#internals.incomingMap.get(secondValue, strongKey)!;
      this.#internals.privateKeyToSharedKeyMap.set(privateKey, firstSharedKey);

      this.#refCountTracker.deleteReference(privateKey, false);
      this.#refCountTracker.addReference(privateKey, firstSharedKey, strongKey);
    }
  }

  #getSharedKey(value: ValueType): SharedKeyBranded | undefined {
    const strongKey = this.#internals.valueToOwnStrongKeyMap.get(value);
    if (!strongKey)
      return undefined;
    const privateKey = this.#internals.incomingMap.get(value, strongKey);
    if (!privateKey)
      return undefined;
    return this.#internals.privateKeyToSharedKeyMap.get(privateKey);
  }

  #setSharedKey(
    value: ValueType,
    strongKey: StrongKeyType,
    sharedKey: SharedKeyBranded
  ): void
  {
    this.#internals.valueToOwnStrongKeyMap.set(value, strongKey);
    const privateKey = this.#internals.incomingMap.getOrInsertComputed(
      value, strongKey, () => OneToOneStrongMap.#getNextSymbol("private")
    );
    this.#internals.privateKeyToSharedKeyMap.set(privateKey, sharedKey);
    this.#internals.outgoingMap.set(sharedKey, strongKey, value);

    if (this.#refCountTracker.hasReference(sharedKey, strongKey) === false) {
      this.#refCountTracker.addReference(privateKey, sharedKey, strongKey);
    }
  }

  public clear(): void {
    if (this.#internals instanceof OneToOneInternalsLive)
      this.#internals = new OneToOneInternalsLive();
  }

  public delete(
    value: ValueType,
    strongKey: StrongKeyType
  ) : boolean
  {
    const sharedKey = this.#getSharedKey(value);
    if (!sharedKey)
      return false;

    const __target__: ValueType | undefined = this.#internals.outgoingMap.get(sharedKey, strongKey);
    if (!__target__)
      return false;

    this.#deleteValue(__target__);
    const remainingKeys: ReadonlySet<StrongKeyType> = this.#internals.outgoingMap.strongKeysFor(sharedKey);
    if (remainingKeys.size < 2) {
      for (const strongKey of remainingKeys) {
        const otherTarget: ValueType = this.#internals.outgoingMap.get(sharedKey, strongKey)!;
        this.#deleteValue(otherTarget);
      }
    }

    return true;
  }

  #deleteValue(value: ValueType): void {
    const strongKey: StrongKeyType = this.#internals.valueToOwnStrongKeyMap.get(value)!;
    const privateKey: PrivateKeyBranded = this.#internals.incomingMap.get(value, strongKey)!;
    const sharedKey: SharedKeyBranded = this.#internals.privateKeyToSharedKeyMap.get(privateKey)!;

    this.#internals.outgoingMap.delete(sharedKey, strongKey);
    this.#internals.incomingMap.delete(value, strongKey);
    this.#internals.valueToOwnStrongKeyMap.delete(value);

    this.#refCountTracker.deleteReference(privateKey, false);
  }

  #deleteRemainingKeys(
    sharedKey: SharedKeyBranded,
    remainingKeys: ReadonlySet<StrongKeyType>
  ): void
  {
    if (this.#internals instanceof OneToOneInternalsInert)
      return;
    for (const strongKey of remainingKeys) {
      const value: ValueType | undefined = this.#internals.outgoingMap.get(sharedKey, strongKey);
      if (!value)
        continue;
      this.delete(value, strongKey);
    }
  }

  public get(
    value: ValueType,
    strongKey: StrongKeyType
  ) : ValueType | undefined
  {
    const weakKey = this.#getSharedKey(value);
    return weakKey ? this.#internals.outgoingMap.get(weakKey, strongKey) : undefined;
  }

  public has(
    value: ValueType,
    strongKey: StrongKeyType
  ) : boolean
  {
    const weakKey = this.#getSharedKey(value);
    return weakKey ? this.#internals.outgoingMap.has(weakKey, strongKey) : false;
  }

  public hasIdentity(
    value: ValueType,
    strongKey: StrongKeyType,
    allowNotDefined: boolean
  ) : boolean
  {
    if (!this.#internals.valueToOwnStrongKeyMap.has(value))
      return allowNotDefined;

    return this.#internals.valueToOwnStrongKeyMap.get(value) === strongKey;
  }

  public readonly [Symbol.toStringTag] = "OneToOneStrongMap";

  public keyWasRevoked(strongKey: StrongKeyType): boolean {
    return this.#internals.outgoingMap.keyWasRevoked(strongKey);
  }

  public revokeStrongKey(strongKey: StrongKeyType): void {
    this.#internals.incomingMap.revokeStrongKey(strongKey);
    this.#internals.outgoingMap.revokeStrongKey(strongKey);
  }

  public revokeEverything(): void {
    this.#internals = new OneToOneInternalsInert();
    this.#refCountTracker = new InertMinRefCountTracker();
  }
}

Object.freeze(OneToOneStrongMap);
Object.freeze(OneToOneStrongMap.prototype);
