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

import cloneableClassesMap from "./cloneableClassesMap.mjs";
import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";


export default class KeyOfTypeofTypedStructureImpl
implements KeyOfTypeofTypedStructure
{
  static clone(
    other: KeyOfTypeofTypedStructure
  ): KeyOfTypeofTypedStructureImpl
  {
    return new KeyOfTypeofTypedStructureImpl(
      other.keyOfAndTypeOf,
      cloneableClassesMap.get(other.ofTypeStructure.kind)!.clone(other)
    );
  }

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
KeyOfTypeofTypedStructureImpl satisfies CloneableStructure<KeyOfTypeofTypedStructure>;

cloneableClassesMap.set(TypeStructureKind.KeyOfTypeof, KeyOfTypeofTypedStructureImpl);
