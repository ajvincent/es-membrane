import {
  CodeBlockWriter
} from "ts-morph";

import type {
  TypeArgumentedTypedStructure,
  TypeStructures,
} from "./TypeStructures.mjs";

import {
  TypeStructureKind
} from "../base/TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import ElementsTypedStructureAbstract from "./ElementsTypedStructureAbstract.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";
import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

export default class TypeArgumentedTypedStructureImpl
extends ElementsTypedStructureAbstract
implements TypeArgumentedTypedStructure
{
  static clone(
    other: TypeArgumentedTypedStructure
  ): TypeArgumentedTypedStructureImpl
  {
    const rv = new TypeArgumentedTypedStructureImpl(
      TypeStructureClassesMap.get(other.kind)!.clone(other)
    );
    rv.elements = other.elements.map(
      typeStructure => TypeStructureClassesMap.get(typeStructure.kind)!.clone(typeStructure)
    );
    return rv;
  }

  public readonly prefix = "<";
  public readonly postfix = ">";
  public readonly joinCharacters = ", ";
  readonly kind: TypeStructureKind.TypeArgumented = TypeStructureKind.TypeArgumented;

  objectType: TypeStructures;

  constructor(objectType: TypeStructures)
  {
    super();
    this.objectType = objectType;

    registerCallbackForTypeStructure(this);
  }

  protected writeTypeStructures(
    writer: CodeBlockWriter
  ): void
  {
    this.objectType.writerFunction(writer);
    super.writeTypeStructures(writer);
  }
}
TypeArgumentedTypedStructureImpl satisfies CloneableStructure<TypeArgumentedTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.TypeArgumented, TypeArgumentedTypedStructureImpl);
