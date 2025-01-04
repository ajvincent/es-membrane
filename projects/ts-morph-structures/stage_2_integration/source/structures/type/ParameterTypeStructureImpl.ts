// #region preamble
import type {
  CodeBlockWriter,
} from "ts-morph";

import {
  type StructureImpls,
  TypeStructureKind,
  type TypeStructures,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  STRUCTURE_AND_TYPES_CHILDREN,
  TypeStructureClassesMap,
  TypeStructuresBase,
} from "../../../snapshot/source/internal-exports.js";

// #endregion preamble

/** Just a parameter name and type for a `FunctionTypeStructureImpl`. */
export default class ParameterTypeStructureImpl
extends TypeStructuresBase<TypeStructureKind.Parameter>
{
  public static clone(
    other: ParameterTypeStructureImpl
  ): ParameterTypeStructureImpl
  {
    let typeClone: TypeStructures | undefined;
    if (other.typeStructure)
      typeClone = TypeStructureClassesMap.clone(other.typeStructure);
    return new ParameterTypeStructureImpl(other.name, typeClone);
  }

  public readonly kind = TypeStructureKind.Parameter;
  public readonly writerFunction = this.#writerFunction.bind(this);

  public name: string;
  public typeStructure: TypeStructures | undefined;

  constructor(
    name: string,
    typeStructure: TypeStructures | undefined
  )
  {
    super();
    this.name = name;
    this.typeStructure = typeStructure;
    this.registerCallbackForTypeStructure();
  }

  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    writer.write(this.name);
    if (this.typeStructure) {
      writer.write(": ");
      this.typeStructure.writerFunction(writer);
    }
  }

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>
  {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    if (typeof this.typeStructure === "object")
      yield this.typeStructure;
  }
}
ParameterTypeStructureImpl satisfies CloneableTypeStructure<ParameterTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Parameter, ParameterTypeStructureImpl);
