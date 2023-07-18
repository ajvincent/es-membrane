import type {
  CodeBlockWriter,
  TypedNodeStructure,
  WriterFunction,
} from "ts-morph";

import {
  TypedNodeTypeStructure
} from "./TypedNodeTypeStructure.mjs";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  TypeStructure
} from "./TypeStructure.mjs";

import {
  getTypeStructureForCallback
} from "./callbackToTypeStructureRegistry.mjs";

function literalWriter(value: string): WriterFunction {
  return function(writer: CodeBlockWriter): void {
    writer.write(value);
  }
}

export default class TypeWriterManager
implements TypedNodeStructure, TypedNodeTypeStructure
{
  #typeWriterFunctionOrStructure: WriterFunction | TypeStructure | undefined;

  get type(): WriterFunction | undefined
  {
    if (typeof this.#typeWriterFunctionOrStructure === "function")
      return this.#typeWriterFunctionOrStructure;

    if (this.#typeWriterFunctionOrStructure) {
      return this.#typeWriterFunctionOrStructure.writerFunction;
    }
  }

  set type(
    value: stringOrWriterFunction | undefined
  )
  {
    if (typeof value === "string") {
      this.#typeWriterFunctionOrStructure = literalWriter(value);
      return;
    }

    if (typeof value === "function") {
      this.#typeWriterFunctionOrStructure = getTypeStructureForCallback(value) ?? value;
      return;
    }

    this.#typeWriterFunctionOrStructure = undefined;
  }

  get typeStructure(): TypeStructure | undefined
  {
    if (typeof this.#typeWriterFunctionOrStructure === "function")
      return undefined;
    return this.#typeWriterFunctionOrStructure;
  }

  set typeStructure(value: TypeStructure | undefined)
  {
    this.#typeWriterFunctionOrStructure = value;
  }
}
