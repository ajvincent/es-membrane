// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  InferTypedStructure,
  TypeStructures,
} from "./TypeStructures.js";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.js";

import TypeStructuresBase from "../base/TypeStructuresBase.js";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.js";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";

import {
  TypeParameterConstraintMode,
  TypeParameterDeclarationImpl,
} from "../exports.js";

import {
  STRUCTURE_AND_TYPES_CHILDREN
} from "../base/symbolKeys.js";

import type {
  StructureImpls
} from "../types/StructureImplUnions.js";
// #endregion preamble

export default class InferTypedStructureImpl
extends TypeStructuresBase
implements InferTypedStructure
{
  readonly kind: TypeStructureKind.Infer = TypeStructureKind.Infer;

  typeParameter: TypeParameterDeclarationImpl;

  constructor(
    typeParameter: TypeParameterDeclarationImpl
  )
  {
    super();
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

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>
  {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    yield this.typeParameter;
  }
}

InferTypedStructureImpl satisfies CloneableStructure<InferTypedStructure>;
TypeStructureClassesMap.set(TypeStructureKind.Infer, InferTypedStructureImpl);
