import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  MappedTypeTypedStructure, TypeStructure
} from "./TypeStructure.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  TypeParameterDeclarationImpl,
  TypeStructureKind,
} from "../../exports.mjs";

import {
  TypeParameterConstraintMode
} from "../structures/TypeParameterDeclarationImpl.mjs";

export default class MappedTypeTypedStructureImpl
implements MappedTypeTypedStructure
{
  readonly kind: TypeStructureKind.Mapped = TypeStructureKind.Mapped;

  readonlyToken: "+readonly" | "-readonly" | "readonly" | undefined;
  parameter: TypeParameterDeclarationImpl;
  asName: TypeStructure | undefined = undefined;
  questionToken: "+?" | "-?" | "?" | undefined;
  type: TypeStructure;

  constructor(
    parameter: TypeParameterDeclarationImpl,
    type: TypeStructure
  )
  {
    this.parameter = parameter;
    this.type = type;

    registerCallbackForTypeStructure(this);
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

      this.parameter.writerFunction(writer, TypeParameterConstraintMode.in);

      if (this.asName) {
        writer.write(" as " );
        this.asName.writerFunction(writer);
      }

      writer.write("]");
      if (this.questionToken) {
        writer.write(this.questionToken);
      }
      writer.write(": ");

      this.type.writerFunction(writer);

      writer.write(";");
    });
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);

  static clone(
    other: MappedTypeTypedStructure
  ): MappedTypeTypedStructureImpl
  {
    const clone = new MappedTypeTypedStructureImpl(
      TypeParameterDeclarationImpl.clone(other.parameter),
      TypeStructureClassesMap.get(other.type.kind)!.clone(other.type),
    );

    if (other.asName) {
      clone.asName = TypeStructureClassesMap.get(other.asName.kind)!.clone(other.asName);
    }

    clone.readonlyToken = other.readonlyToken;
    clone.questionToken = other.questionToken;

    return clone;
  }
}
MappedTypeTypedStructureImpl satisfies CloneableStructure<MappedTypeTypedStructure>;
TypeStructureClassesMap.set(TypeStructureKind.Mapped, MappedTypeTypedStructureImpl);
