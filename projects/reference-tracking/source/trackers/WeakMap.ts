import {
  ReadonlyDeep,
} from "type-fest";

import {
  BuiltInCollections
} from "./utilities/BuiltInCollections.js";

import {
  COLLECT_REFERENCES,
  ReferenceDescription,
  ReferenceDescriptionGetter,
  ReferenceDescriptionIfc,
} from "./utilities/ReferenceDescription.js";

import isObjectOrSymbol from "./utilities/isObjectOrSymbol.js";

const KEY_REFERENCES = Symbol("#keyReferences");
const KEY_WEAKREFS_SET = Symbol("#keyWeakRefsSet");

export class WeakMapTracking<K extends WeakKey, V>
extends BuiltInCollections.WeakMap<K, V>
implements ReferenceDescriptionGetter
{
  private readonly [KEY_REFERENCES] = new BuiltInCollections.WeakMap<K, WeakRef<K>>;
  private readonly [KEY_WEAKREFS_SET] = new BuiltInCollections.Set<WeakRef<K>>

  constructor(entries?: Iterable<readonly [K, V]> | null) {
    super(entries ? Array.from(entries) : undefined);
    if (entries) {
      for (const [key] of entries) {
        const weakRef = new BuiltInCollections.WeakRef<K>(key);
        this[KEY_REFERENCES].set(key, weakRef);
        this[KEY_WEAKREFS_SET].add(weakRef);
      }
    }
  }

  public delete(key: K): boolean {
    const didDelete = super.delete(key);
    if (didDelete) {
      const weakRef = this[KEY_REFERENCES].get(key)!;
      this[KEY_WEAKREFS_SET].delete(weakRef);
      this[KEY_REFERENCES].delete(key);
    }
    return didDelete;
  }

  public set(key: K, value: V): this {
    super.set(key, value);
    if (this[KEY_REFERENCES]) {
      if (!this[KEY_REFERENCES].has(key)) {
        const weakRef = new BuiltInCollections.WeakRef<K>(key);
        this[KEY_REFERENCES].set(key, weakRef);
        this[KEY_WEAKREFS_SET].add(weakRef);
      }
    }
    return this;
  }

  public [COLLECT_REFERENCES](): ReadonlyDeep<ReferenceDescriptionIfc[]> {
    const refs: ReferenceDescription[] = [];

    for (const weakRef of this[KEY_WEAKREFS_SET].values()) {
      const strongRef: K | undefined = weakRef.deref();
      if (strongRef === undefined)
        continue;
      refs.push(new ReferenceDescription("WeakMap", [this], strongRef, false, []));

      const value = this.get(strongRef);
      if (isObjectOrSymbol(value)) {
        refs.push(new ReferenceDescription("WeakMap", [this, strongRef], value, false, []));
      }
    }

    return refs;
  }
}
