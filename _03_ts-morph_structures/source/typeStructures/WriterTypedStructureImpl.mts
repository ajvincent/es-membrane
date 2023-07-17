import type {
  WriterFunction,
} from "ts-morph";

import type {
  WriterTypedStructure
} from "./TypeStructure.mjs";

import {
  TypeStructureKind,
} from "./TypeStructureKind.mjs";

export default class WriterTypedStructureImpl implements WriterTypedStructure {
  readonly kind: TypeStructureKind.Writer = TypeStructureKind.Writer;
  writerFunction: WriterFunction;
  constructor(writer: WriterFunction) {
    this.writerFunction = writer;
  }
}