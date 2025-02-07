import type {
  ReadonlyDeep
} from "type-fest";

import {
  BuiltInCollections
} from "./BuiltInCollections.js";

import type {
  ReferenceDescriptionIfc
} from "../../types/ReferenceDescriptionIfc.js"

export const COLLECT_REFERENCES = Symbol("Collect references");

export interface ReferenceDescriptionGetter {
  [COLLECT_REFERENCES](): ReadonlyDeep<ReferenceDescriptionIfc[]>;
}

export class ReferenceDescription implements ReferenceDescriptionIfc {
  readonly collectionName: string;
  readonly jointOwners: ReadonlySet<WeakKey>;
  readonly referencedValue: WeakKey;
  readonly isStrongReference: boolean;
  readonly contextPrimitives: readonly unknown[];

  constructor(
    collectionName: string,
    jointOwners: readonly (object | symbol)[],
    referencedValue: object | symbol,
    isStrongReference: boolean,
    contextPrimitives: readonly unknown[]
  )
  {
    this.collectionName = collectionName;
    this.jointOwners = new BuiltInCollections.Set(jointOwners);
    this.referencedValue = referencedValue;
    this.isStrongReference = isStrongReference;
    this.contextPrimitives = contextPrimitives?.slice();
  }
}
