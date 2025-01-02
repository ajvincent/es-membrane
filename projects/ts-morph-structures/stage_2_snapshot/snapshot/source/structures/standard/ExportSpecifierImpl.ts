//#region preamble
import type { ExportSpecifierStructureClassIfc } from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type ExportSpecifierStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const ExportSpecifierStructureBase = MultiMixinBuilder<
  [NamedNodeStructureFields, StructureFields],
  typeof StructureBase
>([NamedNodeStructureMixin, StructureMixin], StructureBase);

export default class ExportSpecifierImpl
  extends ExportSpecifierStructureBase
  implements ExportSpecifierStructureClassIfc
{
  readonly kind: StructureKind.ExportSpecifier = StructureKind.ExportSpecifier;
  alias?: string = undefined;
  isTypeOnly = false;

  constructor(name: string) {
    super();
    this.name = name;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<ExportSpecifierStructure>,
    target: ExportSpecifierImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source.alias) {
      target.alias = source.alias;
    }

    target.isTypeOnly = source.isTypeOnly ?? false;
  }

  public static clone(
    source: OptionalKind<ExportSpecifierStructure>,
  ): ExportSpecifierImpl {
    const target = new ExportSpecifierImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<ExportSpecifierImpl> {
    const rv = super.toJSON() as StructureClassToJSON<ExportSpecifierImpl>;
    if (this.alias) {
      rv.alias = this.alias;
    } else {
      rv.alias = undefined;
    }

    rv.isTypeOnly = this.isTypeOnly;
    rv.kind = this.kind;
    return rv;
  }
}

ExportSpecifierImpl satisfies CloneableStructure<
  ExportSpecifierStructure,
  ExportSpecifierImpl
> &
  Class<ExtractStructure<ExportSpecifierStructure["kind"]>>;
StructureClassesMap.set(StructureKind.ExportSpecifier, ExportSpecifierImpl);
