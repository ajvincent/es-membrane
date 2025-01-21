import {
  ReadonlyDeep,
} from "type-fest";

import {
  BuiltInCollections
} from "./BuiltInCollections.js";

import {
  COLLECT_REFERENCES,
  ReferenceDescription,
  ReferenceDescriptionGetter,
  ReferenceDescriptionIfc,
} from "./utilities/ReferenceDescription.js";

import isObjectOrSymbol from "./utilities/isObjectOrSymbol.js";

export class WeakMapTracking<K extends WeakKey, V>
extends BuiltInCollections.WeakMap<K, V>
implements ReferenceDescriptionGetter
{
  readonly #keyReferences = new BuiltInCollections.WeakMap<K, WeakRef<K>>;
  readonly #keyWeakRefsSet = new BuiltInCollections.Set<WeakRef<K>>

  public delete(key: K): boolean {
    const didDelete = super.delete(key);
    const weakRef = this.#keyReferences.get(key)!;
    this.#keyWeakRefsSet.delete(weakRef);
    this.#keyReferences.delete(key);
    return didDelete;
  }

  public set(key: K, value: V): this {
    const didSet = super.set(key, value);
    if (!this.#keyReferences.has(key)) {
      const weakRef = new BuiltInCollections.WeakRef<K>(key);
      this.#keyReferences.set(key, weakRef);
      this.#keyWeakRefsSet.add(weakRef);
    }
    return didSet;
  }

  public [COLLECT_REFERENCES](): ReadonlyDeep<ReferenceDescriptionIfc[]> {
    const refs: ReferenceDescription[] = [];

    for (const weakRef of this.#keyWeakRefsSet.values()) {
      const strongRef: K | undefined = weakRef.deref();
      if (strongRef === undefined)
        continue;
      refs.push(new ReferenceDescription([this], strongRef, false));

      const value = this.get(strongRef);
      if (isObjectOrSymbol(value)) {
        refs.push(new ReferenceDescription([this, strongRef], value, false));
      }
    }

    return refs;
  }
}
