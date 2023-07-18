import {
  CodeBlockWriter
} from "ts-morph";

import ElementsTypedStructureAbstract from "./ElementsTypedStructureAbstract.mjs";

import {
  TupleTypedStructure
} from "./TypeStructure.mjs";

import {
  TypeStructureKind
} from "./TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "./callbackToTypeStructureRegistry.mjs";

export default class TupleTypedStructureImpl
extends ElementsTypedStructureAbstract
implements TupleTypedStructure
{
  readonly kind: TypeStructureKind.Tuple = TypeStructureKind.Tuple;
  isReadonly: boolean;

  public readonly prefix = "[";
  public readonly postfix = "]";
  public readonly joinCharacters = ", ";

  constructor(isReadonly: boolean)
  {
    super();
    this.isReadonly = isReadonly;
    registerCallbackForTypeStructure(this);
  }

  protected writeTypeStructures(
    writer: CodeBlockWriter
  ): void
  {
    if (this.isReadonly)
      writer.write("readonly ");
    return super.writeTypeStructures(writer);
  }
}
