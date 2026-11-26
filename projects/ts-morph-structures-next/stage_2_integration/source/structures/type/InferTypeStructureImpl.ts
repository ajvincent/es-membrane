// #region preamble
import type {
  CodeBlockWriter,
} from "ts-morph";

import type {
  AugmentedStructures,
} from "../../../snapshot/source/exports.js";

import { TypeStructureClassesMap } from "../../base/TypeStructureClassesMap.js";

import {
  TypeStructureKind
} from "../../base/TypeStructureKind.js";

import {
  TypeParameterDeclarationImpl,
} from "../standard/TypeParameterDeclarationImpl.js";

import {
  STRUCTURE_CHILDREN
} from "../../base/symbolKeys.js";

import type {
  CloneableTypeStructure,
} from "../../types/CloneableStructure.js";

import {
  WRITER_FUNCTION_KEY
} from "../WriterStructuresBase.js";

import TypeStructuresWithTypeParameters from "./TypeStructuresWithTypeParameters.js";

// #endregion preamble

/** @example infer \<type\> (extends \<type\>)? */
export class InferTypeStructureImpl
extends TypeStructuresWithTypeParameters<TypeStructureKind.Infer>
{
  readonly kind: TypeStructureKind.Infer = TypeStructureKind.Infer;

  typeParameter: TypeParameterDeclarationImpl;

  constructor(
    typeParameter: TypeParameterDeclarationImpl
  )
  {
    super();
    this.typeParameter = typeParameter;
  }

  /** @internal */
  protected [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void
  {
    writer.write("infer ");
    TypeStructuresWithTypeParameters.writeTypeParameter(
      this.typeParameter, writer, "extends"
    );
  }

  public static clone(
    other: InferTypeStructureImpl
  ): InferTypeStructureImpl
  {
    return new InferTypeStructureImpl(
      TypeParameterDeclarationImpl.clone(other.typeParameter)
    );
  }

  /** @internal */
  public *[STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures>
  {
    yield* super[STRUCTURE_CHILDREN]();
    yield this.typeParameter;
  }
}

InferTypeStructureImpl satisfies CloneableTypeStructure<InferTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Infer, InferTypeStructureImpl);
