import type {
  WriterFunction,
} from "ts-morph";

import TypeWriterManager from "./TypeWriterManager.mjs";

import {
  TypeStructure
} from "../typeStructures/TypeStructure.mjs";

export default class ReturnTypeWriterManager {
  readonly #typeWriterManager = new TypeWriterManager;

  get returnType(): string | WriterFunction | undefined
  {
    return this.#typeWriterManager.type;
  }

  set returnType(
    value: string | WriterFunction | undefined
  )
  {
    this.#typeWriterManager.type = value;
  }

  get returnTypeStructure(): TypeStructure | undefined
  {
    return this.#typeWriterManager.typeStructure;
  }

  set returnTypeStructure(
    value: TypeStructure | undefined
  )
  {
    this.#typeWriterManager.typeStructure = value;
  }
}
