import {
  KindedTypeStructure,
  type StructureImpls,
  TypeStructureKind,
  type TypeStructures,
} from "../../exports.js";

import { STRUCTURE_AND_TYPES_CHILDREN } from "../../internal-exports.js";

import { WriterStructuresBase } from "../WriterStructuresBase.js";

import { GET_OUTER_TYPE } from "../../array-utilities/ShadowArrayImpl.js";

import type { stringOrWriterFunction } from "../../types/stringOrWriterFunction.js";

export default abstract class TypeStructuresBase<Kind extends TypeStructureKind>
  extends WriterStructuresBase
  implements KindedTypeStructure<Kind>
{
  public abstract readonly kind: Kind;

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<
    StructureImpls | TypeStructures
  > {}

  public [GET_OUTER_TYPE](): stringOrWriterFunction {
    return this.writerFunction;
  }
}
