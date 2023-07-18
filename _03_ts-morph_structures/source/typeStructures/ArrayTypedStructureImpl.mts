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

export default class ArrayTypedStructureImpl
implements ArrayTypedStructure
{
  isReadonly: boolean;
  objectType: TypeStructure;
  length: number;
  readonly kind: TypeStructureKind.Array = TypeStructureKind.Array;

  constructor(
    isReadonly: boolean,
    objectType: TypeStructure,
    length: number,
  )
  {
    this.isReadonly = isReadonly;
    this.objectType = objectType;
    this.length = length;

    registerCallbackForTypeStructure(this);
  }

  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    if (this.isReadonly)
      writer.write("readonly ");

    this.objectType.writerFunction(writer);

    writer.write(`[${
      (this.length > 0) && Number.isFinite(this.length) && (this.length % 1 === 0) ?
      this.length :
      ""}]`
    );
  }

  readonly writerFunction = this.#writerFunction.bind(this);
}
