import {
  CodeBlockWriter
} from "ts-morph";

import type {
  ArrayTypedStructure,
  TypeStructures,
} from "./TypeStructures.mjs";

import {
  TypeStructureKind
} from "../base/TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";
import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

export default class ArrayTypedStructureImpl
implements ArrayTypedStructure
{
  static clone(
    other: ArrayTypedStructure
  ): ArrayTypedStructureImpl
  {
    return new ArrayTypedStructureImpl(
      TypeStructureClassesMap.clone(other),
    );
  }

  objectType: TypeStructures;
  readonly kind: TypeStructureKind.Array = TypeStructureKind.Array;

  constructor(
    objectType: TypeStructures,
  )
  {
    this.objectType = objectType;

    registerCallbackForTypeStructure(this);
  }

  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    this.objectType.writerFunction(writer);
    writer.write(`[]`);
  }

  readonly writerFunction = this.#writerFunction.bind(this);
}
ArrayTypedStructureImpl satisfies CloneableStructure<ArrayTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Array, ArrayTypedStructureImpl);
