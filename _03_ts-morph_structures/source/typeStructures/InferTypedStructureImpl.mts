// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  InferTypedStructure,
  TypeStructures,
} from "./TypeStructures.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

import {
  TypeParameterConstraintMode,
  TypeParameterDeclarationImpl,
} from "../../exports.mjs";

// #endregion preamble

export default class InferTypedStructureImpl
implements InferTypedStructure
{
  readonly kind: TypeStructureKind.Infer = TypeStructureKind.Infer;

  typeParameter: TypeParameterDeclarationImpl;

  constructor(
    typeParameter: TypeParameterDeclarationImpl
  )
  {
    this.typeParameter = typeParameter;
    registerCallbackForTypeStructure(this);
  }

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    this.typeParameter.replaceDescendantTypes(filter, replacement);
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.write("infer ");
    this.typeParameter.constraintWriter(writer, TypeParameterConstraintMode.extends);
  }

  writerFunction: WriterFunction = this.#writerFunction.bind(this);

  public static clone(
    other: InferTypedStructure
  ): InferTypedStructureImpl
  {
    return new InferTypedStructureImpl(TypeParameterDeclarationImpl.clone(other.typeParameter));
  }
}

InferTypedStructureImpl satisfies CloneableStructure<InferTypedStructure>;
TypeStructureClassesMap.set(TypeStructureKind.Infer, InferTypedStructureImpl);
