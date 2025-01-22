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

const KEY_REFERENCES = Symbol("#keyReferences");
const KEY_WEAKREFS_SET = Symbol("#keyWeakRefsSet");

export class WeakSetTracking<T extends WeakKey>
extends BuiltInCollections.Set<T>
implements ReferenceDescriptionGetter
{
  private readonly [KEY_REFERENCES] = new BuiltInCollections.WeakMap<T, WeakRef<T>>;
  private readonly [KEY_WEAKREFS_SET] = new BuiltInCollections.Set<WeakRef<T>>;

  constructor(values?: Iterable<T> | null) {
    super(values);
    if (values) {
      for (const value of values) {
        const weakRef = new BuiltInCollections.WeakRef<T>(value);
        this[KEY_REFERENCES].set(value, weakRef);
        this[KEY_WEAKREFS_SET].add(weakRef);
      }
    }
  }

  public add(value: T): this {
    super.add(value);
    if (this[KEY_REFERENCES]) {
      if (!this[KEY_REFERENCES].has(value)) {
        const weakRef = new BuiltInCollections.WeakRef<T>(value);
        this[KEY_REFERENCES].set(value, weakRef);
        this[KEY_WEAKREFS_SET].add(weakRef);
      }
    }
    return this;
  }

  public delete(key: T): boolean {
    const didDelete = super.delete(key);
    if (didDelete) {
      const weakRef = this[KEY_REFERENCES].get(key)!;
      this[KEY_WEAKREFS_SET].delete(weakRef);
      this[KEY_REFERENCES].delete(key);
    }
    return didDelete;
  }

  public [COLLECT_REFERENCES](): ReadonlyDeep<ReferenceDescriptionIfc[]> {
    const refs: ReferenceDescription[] = [];
    for (const weakRef of this[KEY_WEAKREFS_SET].values()) {
      const strongRef: T | undefined = weakRef.deref();
      if (strongRef === undefined)
        continue;
      refs.push(new ReferenceDescription("WeakSet", [this], strongRef, false, []));
    }

    return refs;
  }
}
