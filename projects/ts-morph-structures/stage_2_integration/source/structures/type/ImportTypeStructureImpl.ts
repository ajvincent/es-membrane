import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import {
  /*
  ImportAttributeImpl,
  */
  ParenthesesTypeStructureImpl,
  QualifiedNameTypeStructureImpl,
  StringTypeStructureImpl,
  TypeArgumentedTypeStructureImpl,
  TypeStructureKind,
  type StructureImpls,
  type TypeStructures,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  TypeStructuresBase,
  STRUCTURE_AND_TYPES_CHILDREN,
  TypeStructureClassesMap,
} from "../../../snapshot/source/internal-exports.js";

import LiteralTypeStructureImpl from "./LiteralTypeStructureImpl.js";

/** @example `import("ts-morph").StatementStructures` */
export default
class ImportTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Import>
{
  static readonly #nullIdentifier = new LiteralTypeStructureImpl("");

  readonly #packageIdentifier: ParenthesesTypeStructureImpl;
  readonly #typeArguments: TypeArgumentedTypeStructureImpl;

  readonly kind: TypeStructureKind.Import = TypeStructureKind.Import;
  /*
  readonly attributes: ImportAttributeImpl[] = [];
  */
  readonly childTypes: TypeStructures[];

  constructor(
    argument: StringTypeStructureImpl,
    qualifier: LiteralTypeStructureImpl | QualifiedNameTypeStructureImpl | null,
    typeArguments: TypeStructures[]
  )
  {
    super();
    this.#packageIdentifier = new ParenthesesTypeStructureImpl(argument);

    typeArguments = typeArguments.slice();
    this.#typeArguments = new TypeArgumentedTypeStructureImpl(
      qualifier ?? ImportTypeStructureImpl.#nullIdentifier,
      typeArguments
    );

    this.childTypes = typeArguments;
  }

  get argument(): StringTypeStructureImpl
  {
    return this.#packageIdentifier.childTypes[0] as StringTypeStructureImpl;
  }
  set argument(
    value: StringTypeStructureImpl
  )
  {
    this.#packageIdentifier.childTypes[0] = value;
  }

  get qualifier(): LiteralTypeStructureImpl | QualifiedNameTypeStructureImpl | null
  {
    if (this.#typeArguments.objectType === ImportTypeStructureImpl.#nullIdentifier)
      return null;
    return this.#typeArguments.objectType as LiteralTypeStructureImpl | QualifiedNameTypeStructureImpl;
  }
  set qualifier(
    value: LiteralTypeStructureImpl | QualifiedNameTypeStructureImpl | null
  )
  {
    this.#typeArguments.objectType = value ?? ImportTypeStructureImpl.#nullIdentifier;
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.write("import");
    this.#packageIdentifier.writerFunction(writer);
    if (this.qualifier) {
      writer.write(".");
      this.#typeArguments.writerFunction(writer);
    }
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>
  {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();

    yield this.argument;

    const qualifier = this.qualifier;
    if (qualifier)
      yield qualifier;

    yield* this.childTypes;
  }

  public static clone(
    other: ImportTypeStructureImpl
  ): ImportTypeStructureImpl
  {
    let { qualifier } = other;
    if (qualifier?.kind === TypeStructureKind.Literal) {
      qualifier = LiteralTypeStructureImpl.clone(qualifier);
    }
    else if (qualifier?.kind === TypeStructureKind.QualifiedName) {
      qualifier = QualifiedNameTypeStructureImpl.clone(qualifier);
    }

    return new ImportTypeStructureImpl(
      other.argument,
      qualifier,
      TypeStructureClassesMap.cloneArray(other.childTypes)
    );
  }
}
ImportTypeStructureImpl satisfies CloneableTypeStructure<ImportTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Import, ImportTypeStructureImpl);
