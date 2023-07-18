import {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  KeyOfTypeofTypedStructure,
  TypeStructure,
} from "./TypeStructure.mjs";

import {
  TypeStructureKind
} from "./TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "./callbackToTypeStructureRegistry.mjs";

export default class KeyOfTypeofTypedStructureImpl
implements KeyOfTypeofTypedStructure
{
  readonly kind: TypeStructureKind.KeyOfTypeof = TypeStructureKind.KeyOfTypeof;
  keyOfAndTypeOf: [true, false] | [false, true] | [true, true];
  ofTypeStructure: TypeStructure;

  constructor(
    keyofAndTypeOf: KeyOfTypeofTypedStructure["keyOfAndTypeOf"],
    ofTypeStructure: TypeStructure
  )
  {
    this.keyOfAndTypeOf = keyofAndTypeOf;
    this.ofTypeStructure = ofTypeStructure;

    registerCallbackForTypeStructure(this);
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    if (this.keyOfAndTypeOf[0])
      writer.write("keyof ");
    if (this.keyOfAndTypeOf[1])
      writer.write("typeof ");
    this.ofTypeStructure.writerFunction(writer);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
