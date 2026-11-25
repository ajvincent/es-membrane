import type {
  AugmentedStructures,
} from "../../../snapshot/source/exports.js";

import {
  GET_OUTER_TYPE,
  type InnerTypeElement,
} from "../../array-utilities/ShadowArrayImpl.js"

import type {
  KindedTypeStructure,
  TypeStructureKind
} from "../../base/TypeStructureKind.js";

import {
  STRUCTURE_CHILDREN
} from "../../base/symbolKeys.js";

import type {
  stringOrWriterFunction
} from "../../types/stringOrWriterFunction.js";

import {
  WriterStructuresBase
} from "../WriterStructuresBase.js";

export default
abstract class TypeStructuresBase<Kind extends TypeStructureKind>
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
