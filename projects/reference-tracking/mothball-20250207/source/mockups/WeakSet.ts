import {
  ReadonlyDeep,
} from "type-fest";

import type {
  ReferenceDescriptionIfc
} from "../types/ReferenceDescriptionIfc.js";

import {
  BuiltInCollections
} from "./utilities/BuiltInCollections.js";

import {
  COLLECT_REFERENCES,
  ReferenceDescription,
  ReferenceDescriptionGetter,
} from "./utilities/ReferenceDescription.js";

import {
  WeakRefSet
} from "./utilities/WeakRefSet.js"

const KEY_WEAKREFSET = Symbol("#keyWeakRefSet");

export class WeakSetTracking<T extends WeakKey>
extends BuiltInCollections.Set<T>
implements ReferenceDescriptionGetter
{
  private readonly [KEY_WEAKREFSET] = new WeakRefSet<T>;

  constructor(values?: Iterable<T> | null) {
    super(values);
    if (values) {
      for (const value of values) {
        this[KEY_WEAKREFSET].addReference(value);
      }
    }
  }

  public add(value: T): this {
    super.add(value);
    this[KEY_WEAKREFSET]?.addReference(value);
    return this;
  }

  public delete(value: T): boolean {
    const didDelete = super.delete(value);
    this[KEY_WEAKREFSET].deleteReference(value);
    return didDelete;
  }

  public [COLLECT_REFERENCES](): ReadonlyDeep<ReferenceDescriptionIfc[]> {
    const refs: ReferenceDescription[] = [];
    for (const value of this[KEY_WEAKREFSET].liveElements()) {
      refs.push(new ReferenceDescription("WeakSet", [this], value, false, []));
    }

    return refs;
  }
}
