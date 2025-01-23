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
import {
  WeakRefMap
} from "./utilities/WeakRefMap.js";

const WEAKREFS_MAP = Symbol("#weakRefsMap");

export class WeakMapTracking<K extends WeakKey, V>
extends BuiltInCollections.WeakMap<K, V>
implements ReferenceDescriptionGetter
{
  private readonly [WEAKREFS_MAP]: WeakRefMap<K, V>

  constructor(entries?: Iterable<readonly [K, V]> | null) {
    super(entries ? Array.from(entries) : undefined);
    this[WEAKREFS_MAP] = new WeakRefMap(entries);
  }

  public delete(key: K): boolean {
    const didDelete = super.delete(key);
    this[WEAKREFS_MAP].delete(key);
    return didDelete;
  }

  public set(key: K, value: V): this {
    super.set(key, value);
    this[WEAKREFS_MAP]?.set(key, value);
    return this;
  }

  public [COLLECT_REFERENCES](): ReadonlyDeep<ReferenceDescriptionIfc[]> {
    const refs: ReferenceDescription[] = [];

    for (const [key, value] of this[WEAKREFS_MAP]) {
      refs.push(new ReferenceDescription("WeakMap", [this], key, false, []));
      if (isObjectOrSymbol(value)) {
        refs.push(new ReferenceDescription("WeakMap", [this, key], value, true, []));
      }
    }

    return refs;
  }
}
