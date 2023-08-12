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

  /*
  name: TypeStructure | undefined = undefined;
  */
  get name(): TypeStructure | undefined {
    // I don't know how to serialize the name for a MappedTypeNode.
    return undefined;
  }

  readonlyToken: "+readonly" | "-readonly" | "readonly" | undefined;
  parameter: TypeParameterDeclarationImpl;
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
      TypeStructureClassesMap.get(other.kind)!.clone(other),
    );

    if (other.name) {
      const name = TypeStructureClassesMap.get(other.name.kind)!.clone(other.name);
      void(name);
    }
    clone.readonlyToken = other.readonlyToken;
    clone.questionToken = other.questionToken;

    return clone;
  }
}
MappedTypeTypedStructureImpl satisfies CloneableStructure<MappedTypeTypedStructure>;
TypeStructureClassesMap.set(TypeStructureKind.Mapped, MappedTypeTypedStructureImpl);
