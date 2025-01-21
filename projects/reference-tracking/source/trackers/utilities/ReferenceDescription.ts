import type {
  ReadonlyDeep
} from "type-fest";

import {
  BuiltInCollections
} from "../BuiltInCollections.js";

export const COLLECT_REFERENCES = Symbol("Collect references");

export interface ReferenceDescriptionIfc {
  readonly jointOwners: ReadonlySet<object | symbol>;
  readonly referencedValue: object | symbol;
  readonly isStrongReference: boolean;
}

export interface ReferenceDescriptionGetter {
  [COLLECT_REFERENCES](): ReadonlyDeep<ReferenceDescriptionIfc[]>;
}

export class ReferenceDescription implements ReferenceDescriptionIfc {
  readonly jointOwners: ReadonlySet<object | symbol>;
  readonly referencedValue: object | symbol;
  readonly isStrongReference: boolean;

  constructor(
    jointOwners: readonly (object | symbol)[],
    referencedValue: object | symbol,
    isStrongReference: boolean
  )
  {
    this.jointOwners = new BuiltInCollections.Set(jointOwners);
    this.referencedValue = referencedValue;
    this.isStrongReference = isStrongReference;
  }
}
