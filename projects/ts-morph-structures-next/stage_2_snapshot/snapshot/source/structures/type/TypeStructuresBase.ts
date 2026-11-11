import type {
  AugmentedStructures,
  KindedTypeStructure,
  TypeStructureKind,
} from "../../exports.js";

import { STRUCTURE_CHILDREN } from "../../internal-exports.js";

import { WriterStructuresBase } from "../WriterStructuresBase.js";

import {
  GET_OUTER_TYPE,
  type InnerTypeElement,
} from "../../array-utilities/ShadowArrayImpl.js";

import type { stringOrWriterFunction } from "../../types/stringOrWriterFunction.js";

export default abstract class TypeStructuresBase<Kind extends TypeStructureKind>
  extends WriterStructuresBase
  implements KindedTypeStructure<Kind>, InnerTypeElement<stringOrWriterFunction>
{
  public abstract readonly kind: Kind;

  /** @internal */
  public *[STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures> {}

  public [GET_OUTER_TYPE](): stringOrWriterFunction {
    return this.writerFunction;
  }
}
