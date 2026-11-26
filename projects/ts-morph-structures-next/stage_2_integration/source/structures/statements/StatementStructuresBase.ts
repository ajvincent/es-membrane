import {
  CodeBlockWriter
} from "ts-morph";

import {
  STRUCTURE_CHILDREN
} from "../../base/symbolKeys.js";

import {
  GET_OUTER_TYPE,
  type InnerTypeElement,
} from "../../array-utilities/ShadowArrayImpl.js";

import {
  REPLACE_WRITER_WITH_STRING
} from "../../base/symbolKeys.js";

import {
  StatementStructureKind,
  type KindedStatementStructure
} from "../../base/StatementStructureKind.js";

import type {
  AugmentedStructures
} from "../../types/AugmentedStructures.js";

import type {
  stringOrWriterFunction
} from "../../types/stringOrWriterFunction.js";

import {
  WriterStructuresBase
} from "../WriterStructuresBase.js";

export abstract class StatementStructuresBase<Kind extends StatementStructureKind>
extends WriterStructuresBase
implements KindedStatementStructure<Kind>, InnerTypeElement<stringOrWriterFunction>
{
  public abstract readonly kind: Kind;

  /** @internal */
  public *[STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures>
  {

  }

  public [GET_OUTER_TYPE](): stringOrWriterFunction {
    return this.writerFunction;
  }

  protected static [REPLACE_WRITER_WITH_STRING](
    value: stringOrWriterFunction
  ): string {
    if (typeof value === "function") {
      const writer = new CodeBlockWriter();
      value(writer);
      return writer.toString();
    }

    return value;
  }
}
