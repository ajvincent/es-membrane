import { STRUCTURE_CHILDREN } from "../../internal-exports.js";

import {
  GET_OUTER_TYPE,
  type InnerTypeElement,
} from "../../array-utilities/ShadowArrayImpl.js";

import {
  StatementStructureKind,
  type KindedStatementStructure,
} from "../../base/StatementStructureKind.js";

import type { AugmentedStructures } from "../../types/AugmentedStructures.js";

import type { stringOrWriterFunction } from "../../types/stringOrWriterFunction.js";

import { WriterStructuresBase } from "../WriterStructuresBase.js";

export abstract class StatementStructuresBase<
  Kind extends StatementStructureKind,
>
  extends WriterStructuresBase
  implements
    KindedStatementStructure<Kind>,
    InnerTypeElement<stringOrWriterFunction>
{
  public abstract readonly kind: Kind;

  /** @internal */
  public *[STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures> {}

  public [GET_OUTER_TYPE](): stringOrWriterFunction {
    return this.writerFunction;
  }
}
