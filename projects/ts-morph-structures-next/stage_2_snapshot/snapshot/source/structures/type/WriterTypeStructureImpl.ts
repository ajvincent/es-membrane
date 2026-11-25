// #region preamble
import type { CodeBlockWriter, WriterFunction } from "ts-morph";

import TypeStructureClassesMap from "../../base/TypeStructureClassesMap.js";

import { TypeStructureKind } from "../../base/TypeStructureKind.js";

import type { CloneableTypeStructure } from "../../types/CloneableStructure.js";

import { WRITER_FUNCTION_KEY } from "../WriterStructuresBase.js";

import TypeStructuresBase from "./TypeStructuresBase.js";
// #endregion preamble

/** Wrappers for writer functions from external sources.  Leaf nodes. */
export class WriterTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Writer> {
  static clone(other: WriterTypeStructureImpl): WriterTypeStructureImpl {
    return new WriterTypeStructureImpl(other[WRITER_FUNCTION_KEY]);
  }

  readonly kind = TypeStructureKind.Writer;

  constructor(writer: WriterFunction) {
    super();
    this[WRITER_FUNCTION_KEY] = writer;
  }

  /** @internal */
  protected [WRITER_FUNCTION_KEY]: (writer: CodeBlockWriter) => void;
}
WriterTypeStructureImpl satisfies CloneableTypeStructure<WriterTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Writer, WriterTypeStructureImpl);
