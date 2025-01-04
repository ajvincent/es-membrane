// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import {
  type MappedTypeTypedStructure,
  TypeParameterDeclarationImpl,
  type TypeStructures,
  TypeStructureClassesMap,
  TypeStructureKind,
} from "../exports.js";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.js";

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.js";

import {
  TypeParameterConstraintMode
} from "../structures/TypeParameterDeclarationImpl.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
// #endregion preamble

/**
 * `{ readonly [key in keyof Foo]: boolean }`
 *
 * @see `IndexedAccessTypedStructureImpl` for `Foo["index"]`
 * @see `ObjectLiteralTypedStructureImpl` for `{ [key: string]: boolean }`
 */
export default class MappedTypeTypedStructureImpl
implements MappedTypeTypedStructure
{
  readonly kind: TypeStructureKind.Mapped = TypeStructureKind.Mapped;

  readonlyToken: "+readonly" | "-readonly" | "readonly" | undefined;
  parameter: TypeParameterDeclarationImpl;
  asName: TypeStructures | undefined = undefined;
  questionToken: "+?" | "-?" | "?" | undefined;
  type: TypeStructures | undefined;

  constructor(
    parameter: TypeParameterDeclarationImpl,
  )
  {
    this.parameter = parameter;
    registerCallbackForTypeStructure(this);
  }

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    if (this.asName) {
      replaceDescendantTypeStructures(this, "asName", filter, replacement);
    }

    if (this.type) {
      replaceDescendantTypeStructures(this, "type", filter, replacement);
    }

    this.parameter.replaceDescendantTypes(filter, replacement);
  }

  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    writer.block(() => {
      if (this.readonlyToken) {
        writer.write(this.readonlyToken);
      }
      writer.write("[");

      this.parameter.constraintWriter(writer, TypeParameterConstraintMode.in);

      if (this.asName) {
        writer.write(" as " );
        this.asName.writerFunction(writer);
      }

      writer.write("]");
      if (this.questionToken) {
        writer.write(this.questionToken);
      }

      if (this.type) {
        writer.write(": ");
        this.type.writerFunction(writer);
      }

      writer.write(";");
    });
  }

  writerFunction: WriterFunction = this.#writerFunction.bind(this);

  static clone(
    other: MappedTypeTypedStructure
  ): MappedTypeTypedStructureImpl
  {
    const clone = new MappedTypeTypedStructureImpl(
      TypeParameterDeclarationImpl.clone(other.parameter),
    );

    if (other.asName) {
      clone.asName = TypeStructureClassesMap.clone(other.asName);
    }

    if (other.type) {
      clone.type = TypeStructureClassesMap.clone(other.type);
    }

    clone.readonlyToken = other.readonlyToken;
    clone.questionToken = other.questionToken;

    return clone;
  }
}

MappedTypeTypedStructureImpl satisfies CloneableStructure<MappedTypeTypedStructure>;
TypeStructureClassesMap.set(TypeStructureKind.Mapped, MappedTypeTypedStructureImpl);
