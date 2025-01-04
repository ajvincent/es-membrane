import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  ImportTypedStructure,
  TypeStructures,
} from "./TypeStructures.js";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.js";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.js";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.js";

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.js";

import {
  ParenthesesTypedStructureImpl,
  QualifiedNameTypedStructureImpl,
  StringTypedStructureImpl,
  TypeArgumentedTypedStructureImpl,
} from "../exports.js";

import LiteralTypedStructureImpl from "./LiteralTypedStructureImpl.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";

type QualifierImpl = LiteralTypedStructureImpl | QualifiedNameTypedStructureImpl;

export default class ImportTypedStructureImpl
implements ImportTypedStructure
{
  static clone(
    other: ImportTypedStructure
  ): ImportTypedStructureImpl
  {
    const argument = StringTypedStructureImpl.clone(other.argument);
    let qualifier: QualifierImpl | null = null;
    if (other.qualifier) {
      if (other.qualifier.kind === TypeStructureKind.Literal) {
        qualifier = LiteralTypedStructureImpl.clone(other.qualifier);
      }
      else {
        qualifier = QualifiedNameTypedStructureImpl.clone(other.qualifier);
      }
    }

    return new ImportTypedStructureImpl(
      argument, qualifier, TypeStructureClassesMap.cloneArray(other.childTypes)
    );
  }

  static readonly #nullIdentifier = new LiteralTypedStructureImpl("");

  readonly #packageIdentifier: ParenthesesTypedStructureImpl;
  readonly #typeArguments: TypeArgumentedTypedStructureImpl;
  /*
  readonly attributes: ImportAttribute[] = [];
  */

  constructor(
    argument: StringTypedStructureImpl,
    qualifier: QualifierImpl | null,
    typeArguments: TypeStructures[],
  )
  {
    this.#packageIdentifier = new ParenthesesTypedStructureImpl(argument);

    typeArguments = typeArguments.slice();
    this.#typeArguments = new TypeArgumentedTypedStructureImpl(
      qualifier ?? ImportTypedStructureImpl.#nullIdentifier, typeArguments
    );
    this.childTypes = typeArguments;
    registerCallbackForTypeStructure(this);
  }

  readonly childTypes: TypeStructures[];
  readonly kind = TypeStructureKind.Import;

  get argument(): StringTypedStructureImpl {
    return this.#packageIdentifier.childTypes[0] as StringTypedStructureImpl;
  }
  set argument(value: StringTypedStructureImpl) {
    this.#packageIdentifier.childTypes[0] = value;
  }

  get qualifier(): QualifierImpl | null
  {
    if (this.#typeArguments.objectType === ImportTypedStructureImpl.#nullIdentifier)
      return null;
    return this.#typeArguments.objectType as QualifierImpl;
  }
  set qualifier(value: QualifierImpl | null) {
    this.#typeArguments.objectType = value ?? ImportTypedStructureImpl.#nullIdentifier;
  }

  replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    this.#packageIdentifier.replaceDescendantTypes(filter, replacement);
    this.#typeArguments.replaceDescendantTypes(filter, replacement);
    for (let i = 0; i < this.childTypes.length; i++) {
      replaceDescendantTypeStructures(this.childTypes, i, filter, replacement);
    }
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
}
ImportTypedStructureImpl satisfies CloneableStructure<ImportTypedStructure>;
TypeStructureClassesMap.set(TypeStructureKind.Import, ImportTypedStructureImpl);
