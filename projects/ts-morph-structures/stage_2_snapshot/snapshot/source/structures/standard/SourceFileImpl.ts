//#region preamble
import type { SourceFileStructureClassIfc } from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  type StatementedNodeStructureFields,
  StatementedNodeStructureMixin,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
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

export default class SourceFileImpl
  extends SourceFileStructureBase
  implements SourceFileStructureClassIfc
{
  readonly kind: StructureKind.SourceFile = StructureKind.SourceFile;

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
