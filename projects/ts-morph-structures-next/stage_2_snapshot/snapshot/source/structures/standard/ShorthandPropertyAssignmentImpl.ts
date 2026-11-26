//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import {
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
} from "../../decorators/standard/NamedNodeStructureMixin.js";
import {
  type StructureFields,
  StructureMixin,
} from "../../decorators/standard/StructureMixin.js";
import type { ShorthandPropertyAssignmentStructureClassIfc } from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type OptionalKind,
  type ShorthandPropertyAssignmentStructure,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const ShorthandPropertyAssignmentStructureBase = MultiMixinBuilder<
  [NamedNodeStructureFields, StructureFields],
  typeof StructureBase
>([NamedNodeStructureMixin, StructureMixin], StructureBase);

export class ShorthandPropertyAssignmentImpl
  extends ShorthandPropertyAssignmentStructureBase
  implements ShorthandPropertyAssignmentStructureClassIfc
{
  readonly kind: StructureKind.ShorthandPropertyAssignment =
    StructureKind.ShorthandPropertyAssignment;

  constructor(name: string) {
    super();
    this.name = name;
  }

  /**
   * Create a `ShorthandPropertyAssignmentImpl` from a `ShorthandPropertyAssignmentStructure`.
   * @param source - The structure to clone.
   */
  public static clone(
    source: OptionalKind<ShorthandPropertyAssignmentStructure>,
  ): ShorthandPropertyAssignmentImpl {
    const target = new ShorthandPropertyAssignmentImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<ShorthandPropertyAssignmentImpl> {
    const rv =
      super.toJSON() as StructureClassToJSON<ShorthandPropertyAssignmentImpl>;
    rv.kind = this.kind;
    return rv;
  }
}

ShorthandPropertyAssignmentImpl satisfies CloneableStructure<
  ShorthandPropertyAssignmentStructure,
  ShorthandPropertyAssignmentImpl
> &
  Class<ExtractStructure<ShorthandPropertyAssignmentStructure["kind"]>>;
StructureClassesMap.set(
  StructureKind.ShorthandPropertyAssignment,
  ShorthandPropertyAssignmentImpl,
);
