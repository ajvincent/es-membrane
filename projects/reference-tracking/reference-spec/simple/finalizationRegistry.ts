/* FinalizationRegistry is part of the ECMAScript standard, but justifying its
use is difficult.  Here's one potential use case: a two-keyed weak map.

(This would be more efficient with a three-keyed weak map, but unnecessary
for this demo.)

Normally people do this using `WeakMap<key1, WeakMap<key2, value>>`.
However, that could mean multiple maps existing, one for every first key.

Instead, we can use a small group of collections:
- one map from each key to a number
- a map of strings (serializing the pair of numbers each key forms) to a WeakRef
  holding the joint key
- a `WeakMap<jointKey, value>` for the actual value look-up
- a FinalizationRegistry to tie each key to the joint key, so that they are the
  only strong holders of the joint key

What about removing a (key1, key2) tuple via a delete operation?

The WeakRef can be the unregister token.  Since it holds the joint key, it can
just remove the joint key from the final map.  But then we risk leaking the
WeakRef...

Well, if we re-define the final map as `WeakMap<jointKey, [value, stringKey]>`,
then we have enough information to remove the string key from the map of
strings.

Also worth noting:  this example uses public class fields when we would
normally use private class fields.  This makes it easier to inspect, at least
for now.
*/

interface ValueAndKeyHash<Value> {
  value: Value,
  hash: `[${number}, ${number}]`
}

export class WeakWeakMap<
  KeyTypeOne extends WeakKey,
  KeyTypeTwo extends WeakKey,
  Value
>
{
  readonly keyToNumber = new WeakMap<KeyTypeOne | KeyTypeTwo, number>;
  keyCounter = 0;

  buildHash(
    key1: KeyTypeOne,
    key2: KeyTypeTwo
  ): `[${number}, ${number}]`
  {
    let firstNumber = this.keyToNumber.get(key1);
    if (firstNumber === undefined) {
      firstNumber = this.keyCounter++;
      this.keyToNumber.set(key1, firstNumber);
    }

    let secondNumber = this.keyToNumber.get(key2);
    if (secondNumber === undefined) {
      secondNumber = this.keyCounter++;
      this.keyToNumber.set(key2, secondNumber);
    }

    return `[${firstNumber}, ${secondNumber}]`;
  }

  hashToJointKey = new Map<`[${number}, ${number}]`, ValueAndKeyHash<Value>>;

  cleanupCallback = (weakRef: WeakRef<object>) => {
    void(weakRef);
  }
}

/*
class WeakRefSet<T extends object>
{
  readonly valueToRef = new WeakMap<T, WeakRef<T>>();
  readonly #tokenToValue = new WeakMap<T, T>;
  readonly #references = new Set<WeakRef<T>>;

  #finalizer = new FinalizationRegistry<WeakRef<T>>(
    ref => this.#references.delete(ref)
  );

  addReference(
    value: T,
    ref: WeakRef<T>,
    token: T
  ): void
  {
    this.valueToRef.set(value, ref);
    this.#tokenToValue.set(token, value);
    this.#finalizer.register(value, ref, token);
    this.#references.add(ref);
  }
}

const refSet = new WeakRefSet<object>;

const target = { isTarget: true };
const heldValue = new WeakRef(target);
const token = { isToken: true };

refSet.addReference(target, heldValue, token);

searchReferences("callback before unregistration", callback, [registry], true);
searchReferences("target before unregistration", target, [registry], true);
searchReferences("heldValue before unregistration", heldValue, [registry], true);
searchReferences("unregisterToken before unregistration", token, [registry], true);

registry.unregister(token);
searchReferences("target after unregistration", target, [registry], true);
searchReferences("heldValue after unregistration", heldValue, [registry], true);
searchReferences("unregisterToken after unregistration", token, [registry], true);
*/
