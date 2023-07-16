import type {
  TypedNodeWriter
} from "../../types/ts-morph-typednodewriter.mjs";

import ObjectTypedWriter from "./ObjectTyped.mjs";

export default class IndexedAccessWriter extends ObjectTypedWriter {
  public objectType: TypedNodeWriter;
  public readonly prefix = "[";
  public readonly postfix = "]";
  public readonly joinCharacters = ", ";

  constructor(objectType: TypedNodeWriter)
  {
    super();
    this.objectType = objectType;
  }
}
