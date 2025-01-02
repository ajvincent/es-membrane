//#region preamble
import type { ModuleDeclarationStructureClassIfc } from "../../exports.js";
import {
  type AmbientableNodeStructureFields,
  AmbientableNodeStructureMixin,
  type CloneableStructure,
  COPY_FIELDS,
  type ExportableNodeStructureFields,
  ExportableNodeStructureMixin,
  type ExtractStructure,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
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
  type ModuleDeclarationKind,
  type ModuleDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const ModuleDeclarationStructureBase = MultiMixinBuilder<
  [
    ExportableNodeStructureFields,
    StatementedNodeStructureFields,
    AmbientableNodeStructureFields,
    NamedNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    ExportableNodeStructureMixin,
    StatementedNodeStructureMixin,
    AmbientableNodeStructureMixin,
    NamedNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export default class ModuleDeclarationImpl
  extends ModuleDeclarationStructureBase
  implements ModuleDeclarationStructureClassIfc
{
  readonly kind: StructureKind.Module = StructureKind.Module;
  /**
   * The module declaration kind.
   *
   * @remarks Defaults to "namespace".
   */
  declarationKind?: ModuleDeclarationKind = undefined;

  constructor(name: string) {
    super();
    this.name = name;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<ModuleDeclarationStructure>,
    target: ModuleDeclarationImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source.declarationKind) {
      target.declarationKind = source.declarationKind;
    }
  }

  public static clone(
    source: OptionalKind<ModuleDeclarationStructure>,
  ): ModuleDeclarationImpl {
    const target = new ModuleDeclarationImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<ModuleDeclarationImpl> {
    const rv = super.toJSON() as StructureClassToJSON<ModuleDeclarationImpl>;
    if (this.declarationKind) {
      rv.declarationKind = this.declarationKind;
    } else {
      rv.declarationKind = undefined;
    }

    rv.kind = this.kind;
    return rv;
  }
}

ModuleDeclarationImpl satisfies CloneableStructure<
  ModuleDeclarationStructure,
  ModuleDeclarationImpl
> &
  Class<ExtractStructure<ModuleDeclarationStructure["kind"]>>;
StructureClassesMap.set(StructureKind.Module, ModuleDeclarationImpl);
