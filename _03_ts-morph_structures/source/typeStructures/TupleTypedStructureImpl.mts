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

import cloneableClassesMap from "./cloneableClassesMap.mjs";
import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

export default class TupleTypedStructureImpl
extends ElementsTypedStructureAbstract
implements TupleTypedStructure
{
  static clone(
    other: TupleTypedStructure
  ): TupleTypedStructureImpl
  {
    const rv = new TupleTypedStructureImpl(
      other.isReadonly
    );
    rv.elements = other.elements.map(
      typeStructure => cloneableClassesMap.get(typeStructure.kind)!.clone(typeStructure)
    );
    return rv;
  }

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
TupleTypedStructureImpl satisfies CloneableStructure<TupleTypedStructure>;
