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

import isObjectOrSymbol from "./utilities/isObjectOrSymbol.js";

export class MapTracking<K, V>
extends BuiltInCollections.Map<K, V>
implements ReferenceDescriptionGetter
{
  public [COLLECT_REFERENCES](): ReadonlyDeep<ReferenceDescriptionIfc[]> {
    const refs: ReferenceDescription[] = [];
    for (const [key, value] of this.entries()) {
      if (isObjectOrSymbol(key)) {
        refs.push(new ReferenceDescription("Map", [this], key, true, []));
        if (isObjectOrSymbol(value))
          refs.push(new ReferenceDescription("Map", [this, key], value, true, []));
      }

      else if (isObjectOrSymbol(value))
        refs.push(new ReferenceDescription("Map", [this], value, true, [key]));
    }

    return refs;
  }
}
