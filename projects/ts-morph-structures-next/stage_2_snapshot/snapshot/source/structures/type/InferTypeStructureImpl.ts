// #region preamble
import type { CodeBlockWriter, WriterFunction } from "ts-morph";

import {
  type StructureImpls,
  TypeParameterDeclarationImpl,
  TypeStructureKind,
  type TypeStructures,
} from "../../exports.js";

import {
  type CloneableTypeStructure,
  STRUCTURE_AND_TYPES_CHILDREN,
  TypeStructureClassesMap,
  TypeStructuresWithTypeParameters,
  WRITER_FUNCTION_KEY,
} from "../../internal-exports.js";

// #endregion preamble

/** @example infer \<type\> (extends \<type\>)? */
export class InferTypeStructureImpl extends TypeStructuresWithTypeParameters<TypeStructureKind.Infer> {
  readonly kind: TypeStructureKind.Infer = TypeStructureKind.Infer;

  typeParameter: TypeParameterDeclarationImpl;

  constructor(typeParameter: TypeParameterDeclarationImpl) {
    super();
    this.typeParameter = typeParameter;
  }

  /** @internal */
  protected [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void {
    writer.write("infer ");
    TypeStructuresWithTypeParameters.writeTypeParameter(
      this.typeParameter,
      writer,
      "extends",
    );
  }

  public static clone(other: InferTypeStructureImpl): InferTypeStructureImpl {
    return new InferTypeStructureImpl(
      TypeParameterDeclarationImpl.clone(other.typeParameter),
    );
  }

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<
    StructureImpls | TypeStructures
  > {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    yield this.typeParameter;
  }
}

InferTypeStructureImpl satisfies CloneableTypeStructure<InferTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Infer, InferTypeStructureImpl);
