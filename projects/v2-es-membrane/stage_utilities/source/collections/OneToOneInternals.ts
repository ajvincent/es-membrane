import { InertWeakMap } from "./inert/WeakMap.js";
import { InertWeakStrongMap } from "./inert/WeakStrongMap.js";
import type {
  WeakStrongMapIfc
} from "./types/WeakStrongMap.js";
import { WeakStrongMap } from "./WeakStrongMap.js";

export declare const WeakKeyBranding: unique symbol;
export type WeakKeyBranded<Brand extends string> = symbol & { [WeakKeyBranding]: Brand};
export type PrivateKeyBranded = WeakKeyBranded<"private">;
export type SharedKeyBranded = WeakKeyBranded<"shared">;

export interface OneToOneInternalsIfc<StrongKeyType, ValueType extends WeakKey> {
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

  readonly valueToOwnStrongKeyMap: WeakMap<ValueType, StrongKeyType>;
  readonly incomingMap: WeakStrongMapIfc<ValueType, StrongKeyType, PrivateKeyBranded>;
  readonly privateKeyToSharedKeyMap: WeakMap<PrivateKeyBranded, SharedKeyBranded>;
  readonly outgoingMap: WeakStrongMapIfc<SharedKeyBranded, StrongKeyType, ValueType>;
}

export class OneToOneInternalsLive<StrongKeyType, ValueType extends WeakKey>
implements OneToOneInternalsIfc<StrongKeyType, ValueType>
{
  readonly valueToOwnStrongKeyMap = new WeakMap<ValueType, StrongKeyType>;
  readonly incomingMap = new WeakStrongMap<ValueType, StrongKeyType, PrivateKeyBranded>;
  readonly privateKeyToSharedKeyMap = new WeakMap<PrivateKeyBranded, SharedKeyBranded>;
  readonly outgoingMap = new WeakStrongMap<SharedKeyBranded, StrongKeyType, ValueType>;
}

export class OneToOneInternalsInert<StrongKeyType, ValueType extends WeakKey>
implements OneToOneInternalsIfc<StrongKeyType, ValueType>
{
  readonly valueToOwnStrongKeyMap = new InertWeakMap<ValueType, StrongKeyType>;
  readonly incomingMap = new InertWeakStrongMap<ValueType, StrongKeyType, PrivateKeyBranded>;
  readonly privateKeyToSharedKeyMap = new InertWeakMap<PrivateKeyBranded, SharedKeyBranded>;
  readonly outgoingMap = new InertWeakStrongMap<SharedKeyBranded, StrongKeyType, ValueType>;
}
