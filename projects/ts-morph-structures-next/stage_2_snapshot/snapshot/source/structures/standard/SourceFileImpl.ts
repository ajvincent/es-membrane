//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import {
  type StatementedNodeStructureFields,
  StatementedNodeStructureMixin,
} from "../../decorators/standard/StatementedNodeStructureMixin.js";
import {
  type StructureFields,
  StructureMixin,
} from "../../decorators/standard/StructureMixin.js";
import type { SourceFileStructureClassIfc } from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type OptionalKind,
  type SourceFileStructure,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const SourceFileStructureBase = MultiMixinBuilder<
  [StatementedNodeStructureFields, StructureFields],
  typeof StructureBase
>([StatementedNodeStructureMixin, StructureMixin], StructureBase);

export class SourceFileImpl
  extends SourceFileStructureBase
  implements SourceFileStructureClassIfc
{
  readonly kind: StructureKind.SourceFile = StructureKind.SourceFile;

  /**
   * Create a `SourceFileImpl` from a `SourceFileStructure`.
   * @param source - The structure to clone.
   */
  public static clone(
    source: OptionalKind<SourceFileStructure>,
  ): SourceFileImpl {
    const target = new SourceFileImpl();
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<SourceFileImpl> {
    const rv = super.toJSON() as StructureClassToJSON<SourceFileImpl>;
    rv.kind = this.kind;
    return rv;
  }
}

SourceFileImpl satisfies CloneableStructure<
  SourceFileStructure,
  SourceFileImpl
> &
  Class<ExtractStructure<SourceFileStructure["kind"]>>;
StructureClassesMap.set(StructureKind.SourceFile, SourceFileImpl);
