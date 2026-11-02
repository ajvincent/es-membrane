import {
  type StructureImpls,
} from "../../../snapshot/source/exports.js";

import {
  STRUCTURE_AND_TYPES_CHILDREN
} from "../../../snapshot/source/internal-exports.js";

import {
  GET_OUTER_TYPE,
  type InnerTypeElement,
} from "../../array-utilities/ShadowArrayImpl.js"

import {
  StatementStructureKind,
  type KindedStatementStructure
} from "../../base/StatementStructureKind.js";

import type {
  stringOrWriterFunction
} from "../../types/stringOrWriterFunction.js";

import {
  WriterStructuresBase
} from "../WriterStructuresBase.js";

import type {
  AugmentedStatementStructures
} from "./AugmentedStatements.js";

export abstract class StatementStructuresBase<Kind extends StatementStructureKind>
extends WriterStructuresBase
implements KindedStatementStructure<Kind>, InnerTypeElement<stringOrWriterFunction>
{
  public abstract readonly kind: Kind;

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<
    StructureImpls | AugmentedStatementStructures
  >
  {

  }

  public [GET_OUTER_TYPE](): stringOrWriterFunction {
    return this.writerFunction;
  }
}
