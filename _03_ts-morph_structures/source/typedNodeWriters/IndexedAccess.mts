import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";

import ObjectPrefixedWriter from "./ObjectPrefixed.mjs";
import StringWriter from "./String.mjs";

export default class IndexedAccessWriter extends ObjectPrefixedWriter
{
  public objectType: TypedNodeWriter;
  public readonly prefix = "[";
  public readonly postfix = "]";
  public readonly joinCharacters = ", ";
  public readonly children: [StringWriter];

  constructor(objectType: TypedNodeWriter, index: StringWriter)
  {
    super();
    this.objectType = objectType;
    this.children = [index];
  }
}
