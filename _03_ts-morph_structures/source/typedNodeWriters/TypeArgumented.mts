import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";

import ObjectPrefixedWriter from "./ObjectPrefixed.mjs";

export default class TypeArgumentedWriter extends ObjectPrefixedWriter
{
  public objectType: TypedNodeWriter;
  public readonly prefix = "<";
  public readonly postfix = ">";
  public readonly joinCharacters = ", ";

  constructor(objectType: TypedNodeWriter)
  {
    super();
    this.objectType = objectType;
  }
}
