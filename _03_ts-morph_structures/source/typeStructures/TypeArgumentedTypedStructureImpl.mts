// #region preamble
import {
  CodeBlockWriter, WriterFunction
} from "ts-morph";

import type {
  TypeArgumentedTypedStructure,
  TypeStructures,
} from "./TypeStructures.mjs";

import {
  TypePrinter,
  TypePrinterSettingsBase,
} from "../base/TypePrinter.mjs";

import {
  TypeStructureKind
} from "../base/TypeStructureKind.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.mjs";

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
implements TypeArgumentedTypedStructure
{
  static clone(
    other: TypeArgumentedTypedStructure
  ): TypeArgumentedTypedStructureImpl
  {
    return new TypeArgumentedTypedStructureImpl(
      TypeStructureClassesMap.clone(other.objectType),
      TypeStructureClassesMap.cloneArray(other.childTypes),
    );
  }

  readonly kind: TypeStructureKind.TypeArgumented = TypeStructureKind.TypeArgumented;

  objectType: TypeStructures;
  childTypes: TypeStructures[] = [];
  readonly printSettings = new TypePrinterSettingsBase;

  constructor(
    objectType: TypeStructures,
    childTypes: TypeStructures[] = []
  )
  {
    this.objectType = objectType;
    this.appendStructures(childTypes);

    registerCallbackForTypeStructure(this);
  }

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    replaceDescendantTypeStructures(this, "objectType", filter, replacement);

    for (let i = 0; i < this.childTypes.length; i++) {
      replaceDescendantTypeStructures(this.childTypes, i, filter, replacement);
    }
  }

  public appendStructures(
    structuresContext: TypeStructures[]
  ): this
  {
    this.childTypes.push(...structuresContext);
    return this;
  }

  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    TypePrinter(writer, {
      ...this.printSettings,
      objectType: this.objectType,
      childTypes: this.childTypes,
      startToken: "<",
      joinChildrenToken: ", ",
      endToken: ">",
    });
  }

  writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
TypeArgumentedTypedStructureImpl satisfies CloneableStructure<TypeArgumentedTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.TypeArgumented, TypeArgumentedTypedStructureImpl);
