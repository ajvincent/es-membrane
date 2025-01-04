// #region preamble
import {
  CodeBlockWriter, WriterFunction
} from "ts-morph";

import {
  QualifiedNameTypedStructure,
  TypeStructures,
} from "./TypeStructures.js";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.js";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.js";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.js";

// #endregion preamble

export default class QualifiedNameTypedStructureImpl
implements QualifiedNameTypedStructure
{
  static clone(
    other: QualifiedNameTypedStructure
  ): QualifiedNameTypedStructureImpl
  {
    return new QualifiedNameTypedStructureImpl(
      TypeStructureClassesMap.cloneArray(other.childTypes)
    );
  }

  readonly kind: TypeStructureKind.QualifiedName = TypeStructureKind.QualifiedName;
  readonly childTypes: TypeStructures[] = [];

  #writerFunction(writer: CodeBlockWriter): void
  {
    const lastIndex = this.childTypes.length - 1;
    this.childTypes.forEach((childType, index) => {
      childType.writerFunction(writer);
      if (index !== lastIndex)
        writer.write(".");
    });
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);

  constructor(
    childTypes: TypeStructures[] = [],
  )
  {
    this.appendStructures(childTypes);
    registerCallbackForTypeStructure(this);
  }

  public appendStructures(
    structuresContext: TypeStructures[]
  ): this
  {
    this.childTypes.push(...structuresContext);
    return this;
  }

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    for (let i = 0; i < this.childTypes.length; i++) {
      replaceDescendantTypeStructures(this.childTypes, i, filter, replacement);
    }
  }
}

QualifiedNameTypedStructureImpl satisfies CloneableStructure<QualifiedNameTypedStructure>;
TypeStructureClassesMap.set(TypeStructureKind.QualifiedName, QualifiedNameTypedStructureImpl);
