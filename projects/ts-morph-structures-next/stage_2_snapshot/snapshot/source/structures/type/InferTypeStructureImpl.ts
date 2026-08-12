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
} from "../../internal-exports.js";

// #endregion preamble

/** @example infer \<type\> (extends \<type\>)? */
export default class InferTypeStructureImpl extends TypeStructuresWithTypeParameters<TypeStructureKind.Infer> {
  readonly kind: TypeStructureKind.Infer = TypeStructureKind.Infer;

  typeParameter: TypeParameterDeclarationImpl;

  constructor(typeParameter: TypeParameterDeclarationImpl) {
    super();
    this.typeParameter = typeParameter;
    this.registerCallbackForTypeStructure();
  }

  #writerFunction(writer: CodeBlockWriter): void {
    writer.write("infer ");
    TypeStructuresWithTypeParameters.writeTypeParameter(
      this.typeParameter,
      writer,
      "extends",
    );
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);

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
