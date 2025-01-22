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

export class SetTracking<T>
extends BuiltInCollections.Set<T>
implements ReferenceDescriptionGetter {
  public [COLLECT_REFERENCES](): ReadonlyDeep<ReferenceDescriptionIfc[]> {
    const refs: ReferenceDescription[] = [];
    for (const value of this.values()) {
      if (isObjectOrSymbol(value)) {
        refs.push(new ReferenceDescription("Set", [this], value, true, []));
      }
    }
    return refs;
  }
}
