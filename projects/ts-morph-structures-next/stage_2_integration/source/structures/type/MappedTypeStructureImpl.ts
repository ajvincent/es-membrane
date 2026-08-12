// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import {
  type StructureImpls,
  TypeParameterDeclarationImpl,
  TypeStructureKind,
  type TypeStructures,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  STRUCTURE_AND_TYPES_CHILDREN,
  TypeStructureClassesMap,
  TypeStructuresWithTypeParameters,
} from "../../../snapshot/source/internal-exports.js";

// #endregion preamble

/**
 * `{ readonly [key in keyof Foo]: boolean }`
 *
 * @see `IndexedAccessTypedStructureImpl` for `Foo["index"]`
 * @see `ObjectLiteralTypedStructureImpl` for `{ [key: string]: boolean }`
 */
export default class MappedTypeStructureImpl
extends TypeStructuresWithTypeParameters<TypeStructureKind.Mapped>
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
    super();
    this.parameter = parameter;
    this.registerCallbackForTypeStructure();
  }

  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    writer.block(() => {
      if (this.readonlyToken) {
        writer.write(this.readonlyToken + " ");
      }
      writer.write("[");

      TypeStructuresWithTypeParameters.writeTypeParameter(this.parameter, writer, "in");

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

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);

  static clone(
    other: MappedTypeStructureImpl
  ): MappedTypeStructureImpl
  {
    const clone = new MappedTypeStructureImpl(
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

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>
  {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    yield this.parameter;
    if (typeof this.asName === "object")
      yield this.asName;
    if (typeof this.type === "object")
      yield this.type;
  }
}

MappedTypeStructureImpl satisfies CloneableTypeStructure<MappedTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Mapped, MappedTypeStructureImpl);
