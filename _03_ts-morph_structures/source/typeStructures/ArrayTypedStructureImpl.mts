import {
  CodeBlockWriter
} from "ts-morph";

import type {
  ArrayTypedStructure,
  TypeStructure,
} from "./TypeStructure.mjs";

import {
  TypeStructureKind
} from "./TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "./callbackToTypeStructureRegistry.mjs";

import TypeStructureClassesMap from "./TypeStructureClassesMap.mjs";
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
      TypeStructureClassesMap.get(other.kind)!.clone(other),
    );
  }

  objectType: TypeStructure;
  readonly kind: TypeStructureKind.Array = TypeStructureKind.Array;

  constructor(
    objectType: TypeStructure,
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
