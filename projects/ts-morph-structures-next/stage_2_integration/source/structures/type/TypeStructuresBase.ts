import {
  KindedTypeStructure,
  type StructureImpls,
  TypeStructureKind,
  type TypeStructures,
} from "../../../snapshot/source/exports.js";

import {
  STRUCTURE_AND_TYPES_CHILDREN
} from "../../../snapshot/source/internal-exports.js";

import {
  WriterStructuresBase
} from "../WriterStructuresBase.js";

export default
abstract class TypeStructuresBase<Kind extends TypeStructureKind>
extends WriterStructuresBase
implements KindedTypeStructure<Kind>
{
  public abstract readonly kind: Kind;

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<
    StructureImpls | TypeStructures
  > {}
}
