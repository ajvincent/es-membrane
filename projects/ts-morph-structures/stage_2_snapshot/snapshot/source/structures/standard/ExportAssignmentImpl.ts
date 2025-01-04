//#region preamble
import type {
  ExportAssignmentStructureClassIfc,
  stringOrWriterFunction,
} from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  REPLACE_WRITER_WITH_STRING,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type ExportAssignmentStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const ExportAssignmentStructureBase = MultiMixinBuilder<
  [JSDocableNodeStructureFields, StructureFields],
  typeof StructureBase
>([JSDocableNodeStructureMixin, StructureMixin], StructureBase);

export default class ExportAssignmentImpl
  extends ExportAssignmentStructureBase
  implements ExportAssignmentStructureClassIfc
{
  readonly kind: StructureKind.ExportAssignment =
    StructureKind.ExportAssignment;
  expression: stringOrWriterFunction;
  isExportEquals = false;

  constructor(expression: stringOrWriterFunction) {
    super();
    this.expression = expression;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<ExportAssignmentStructure>,
    target: ExportAssignmentImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    target.expression = source.expression;
    target.isExportEquals = source.isExportEquals ?? false;
  }

  public static clone(
    source: OptionalKind<ExportAssignmentStructure>,
  ): ExportAssignmentImpl {
    const target = new ExportAssignmentImpl(source.expression);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<ExportAssignmentImpl> {
    const rv = super.toJSON() as StructureClassToJSON<ExportAssignmentImpl>;
    rv.expression = StructureBase[REPLACE_WRITER_WITH_STRING](this.expression);
    rv.isExportEquals = this.isExportEquals;
    rv.kind = this.kind;
    return rv;
  }
}

ExportAssignmentImpl satisfies CloneableStructure<
  ExportAssignmentStructure,
  ExportAssignmentImpl
> &
  Class<ExtractStructure<ExportAssignmentStructure["kind"]>>;
StructureClassesMap.set(StructureKind.ExportAssignment, ExportAssignmentImpl);
