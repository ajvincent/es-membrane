# OneToOneStrongMap can leak memory if we are not careful

## SOLVED: Revoking a strong key doesn't clean up `weakValueToInternalMap`

```typescript
const oneToOne = new OneToOneStrongMap<object, string>;
class DumbObject {
  readonly id: string;
  constructor(id: string) {
    this.id = id;
  }
}

const firstGraphKey = "first key";
const secondGraphKey = "second key";

const firstValue = new DumbObject("first value");
const secondValue = new DumbObject("second value");
testMap.bindOneToOne(firstGraphKey, firstValue, secondGraphKey, secondValue);

testMap.revokeStrongKey(secondGraphKey);

searchReferences(
  "second value holds reference to first value", firstValue, [testMap, secondValue], true
); // this would show we hold a reference we didn't intend.
```

This is a problem because secondValue is likely to be a proxy to firstValue.

## Holding a shared internal key just by creating the binding

The implementation of `OneToOneStrongMap` has the following:

```typescript
class InternalKey {
  doNotCallMe(): never {
    throw new Error("don't call me");
  }
}

export class OneToOneStrongMap<StrongKeyType, ValueType extends object>
implements OneToOneStrongMapIfc<StrongKeyType, ValueType>
{
  #baseMap: WeakStrongMapIfc<InternalKey, StrongKeyType, ValueType> = new WeakStrongMap;
  #weakValueToInternalKeyMap: WeakMap<ValueType, InternalKey> = new WeakMap;
  // ...
}
```

It works by having each value in `bindOneToOne` hold a reference via `#weakValueToInternalKeyMap` to an internal key.
The `delete()` operation cleans up this internal key, but `revokeStrongKey` does _not_.  To be fair, it's an unreachable
cycle:

` firstValue => InternalKey => firstValue `

But it _is_ a cycle, and one we can't easily clean up. without _knowing_ there's no other way to reach it.  That involves enumerating weak keys, which JavaScript engines generally frown on.  `WeakRefSet` might help here.

## Internal, "no outbound reference" graph keys

`OneToOneStrongMap` treats every graph key equally when maybe it shouldn't.

```typescript
const firstGraphKey = "first key";
const secondGraphKey = "second key";
const internalKey = Symbol("internal key");

// currently illegal TypeScript: we can't specify any arguments to the constructor
const oneToOne = new OneToOneStrongMap<object, string | symbol>(new Set([internalKey]));
class DumbObject {
  readonly id: string;
  constructor(id: string) {
    this.id = id;
  }
}

const firstValue = new DumbObject("first value");
const secondValue = new DumbObject("second value");
const internalValue = new DumbOject("internal value");

// this might happen because we told a developer "trust us to manage your array internally"
testMap.bindOneToOne(internalKey, internalValue, firstGraphKey, firstValue);
testMap.bindOneToOne(firstGraphKey, firstValue, secondGraphKey, secondValue);

testMap.revokeStrongKey(secondGraphKey);

searchReferences(
  "internal value holds reference to first value", firstValue, [testMap, internalValue], true
); // this would show we hold a reference we didn't intend.
```

As a membrane developer, I would prefer the internal value hold no references to the first value.  The current design
makes that unavoidable.
