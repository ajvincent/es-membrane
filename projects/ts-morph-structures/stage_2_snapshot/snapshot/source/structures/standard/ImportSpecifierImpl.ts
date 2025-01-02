//#region preamble
import type { ImportSpecifierStructureClassIfc } from "../../exports.js";
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
  type ImportSpecifierStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const ImportSpecifierStructureBase = MultiMixinBuilder<
  [NamedNodeStructureFields, StructureFields],
  typeof StructureBase
>([NamedNodeStructureMixin, StructureMixin], StructureBase);

export default class ImportSpecifierImpl
  extends ImportSpecifierStructureBase
  implements ImportSpecifierStructureClassIfc
{
  readonly kind: StructureKind.ImportSpecifier = StructureKind.ImportSpecifier;
  alias?: string = undefined;
  isTypeOnly = false;

  constructor(name: string) {
    super();
    this.name = name;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<ImportSpecifierStructure>,
    target: ImportSpecifierImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source.alias) {
      target.alias = source.alias;
    }

    target.isTypeOnly = source.isTypeOnly ?? false;
  }

  public static clone(
    source: OptionalKind<ImportSpecifierStructure>,
  ): ImportSpecifierImpl {
    const target = new ImportSpecifierImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<ImportSpecifierImpl> {
    const rv = super.toJSON() as StructureClassToJSON<ImportSpecifierImpl>;
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

ImportSpecifierImpl satisfies CloneableStructure<
  ImportSpecifierStructure,
  ImportSpecifierImpl
> &
  Class<ExtractStructure<ImportSpecifierStructure["kind"]>>;
StructureClassesMap.set(StructureKind.ImportSpecifier, ImportSpecifierImpl);
