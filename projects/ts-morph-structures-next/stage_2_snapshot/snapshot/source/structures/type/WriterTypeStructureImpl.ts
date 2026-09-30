// #region preamble
import type { CodeBlockWriter, WriterFunction } from "ts-morph";

import { TypeStructureKind } from "../../exports.js";

import {
  type CloneableTypeStructure,
  TypeStructuresBase,
  TypeStructureClassesMap,
  WRITER_FUNCTION_KEY,
} from "../../internal-exports.js";
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
