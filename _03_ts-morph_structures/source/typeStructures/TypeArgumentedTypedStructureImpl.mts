import {
  CodeBlockWriter
} from "ts-morph";

import type {
  TypeArgumentedTypedStructure,
  TypeStructure,
} from "./TypeStructure.mjs";

import {
  TypeStructureKind
} from "./TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "./callbackToTypeStructureRegistry.mjs";

import ElementsTypedStructureAbstract from "./ElementsTypedStructureAbstract.mjs";

import cloneableClassesMap from "./cloneableClassesMap.mjs";
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
      cloneableClassesMap.get(other.kind)!.clone(other)
    );
    rv.elements = other.elements.map(
      typeStructure => cloneableClassesMap.get(typeStructure.kind)!.clone(typeStructure)
    );
    return rv;
  }

  public readonly prefix = "<";
  public readonly postfix = ">";
  public readonly joinCharacters = ", ";
  readonly kind: TypeStructureKind.TypeArgumented = TypeStructureKind.TypeArgumented;

  objectType: TypeStructure;

  constructor(objectType: TypeStructure)
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
