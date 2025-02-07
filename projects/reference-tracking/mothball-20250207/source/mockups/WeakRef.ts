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

export class WeakRefTracking<T extends WeakKey>
extends BuiltInCollections.WeakRef<T>
implements ReferenceDescriptionGetter
{
  public [COLLECT_REFERENCES](): ReadonlyDeep<ReferenceDescriptionIfc[]> {
    const refs: ReferenceDescription[] = [];
    const strongRef: T | undefined = this.deref();
    if (strongRef) {
      refs.push(new ReferenceDescription("WeakRef", [this], strongRef, false, []));
    }
    return refs;
  }
}
