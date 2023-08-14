// #region preamble
import {
  CodeBlockWriter
} from "ts-morph";

import ElementsTypedStructureAbstract from "./ElementsTypedStructureAbstract.mjs";

import type {
  TypeArgumentedTypedStructure,
  TypeStructures,
} from "./TypeStructures.mjs";

import {
  TypeStructureKind
} from "../base/TypeStructureKind.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion preamble

/**
 * `Pick<NumberStringType, "repeatForward">`
 *
 * This resolves type parameters, as opposed to defining them.
 *
 * @see `TypeParameterDeclarationImpl` for `Type<Foo extends object>`
 */
export default class TypeArgumentedTypedStructureImpl
extends ElementsTypedStructureAbstract
implements TypeArgumentedTypedStructure
{
  static clone(
    other: TypeArgumentedTypedStructure
  ): TypeArgumentedTypedStructureImpl
  {
    return new TypeArgumentedTypedStructureImpl(
      TypeStructureClassesMap.clone(other.objectType),
      TypeStructureClassesMap.cloneArray(other.elements),
    );
  }

  public readonly prefix = "<";
  public readonly postfix = ">";
  public readonly joinCharacters = ", ";
  readonly kind: TypeStructureKind.TypeArgumented = TypeStructureKind.TypeArgumented;

  objectType: TypeStructures;

  constructor(
    objectType: TypeStructures,
    elements: TypeStructures[] = []
  )
  {
    super();
    this.objectType = objectType;
    this.appendStructures(elements);

    registerCallbackForTypeStructure(this);
  }

  appendStructures(
    structuresContext: TypeStructures[]
  ): this
  {
    this.elements.push(...structuresContext);
    return this;
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
