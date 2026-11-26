//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import {
  type AmbientableNodeStructureFields,
  AmbientableNodeStructureMixin,
} from "../../decorators/standard/AmbientableNodeStructureMixin.js";
import {
  type ExportableNodeStructureFields,
  ExportableNodeStructureMixin,
} from "../../decorators/standard/ExportableNodeStructureMixin.js";
import {
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
} from "../../decorators/standard/JSDocableNodeStructureMixin.js";
import {
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
} from "../../decorators/standard/NamedNodeStructureMixin.js";
import {
  type StatementedNodeStructureFields,
  StatementedNodeStructureMixin,
} from "../../decorators/standard/StatementedNodeStructureMixin.js";
import {
  type StructureFields,
  StructureMixin,
} from "../../decorators/standard/StructureMixin.js";
import type { ModuleDeclarationStructureClassIfc } from "../../exports.js";
import {
  type CloneableStructure,
  type ExtractStructure,
  GET_OUTER_TYPE,
  type InnerTypeElement,
  type StructureClassToJSON,
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

export class ModuleDeclarationImpl
  extends ModuleDeclarationStructureBase
  implements
    ModuleDeclarationStructureClassIfc,
    InnerTypeElement<ModuleDeclarationImpl>
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

  /**
   * Create a `ModuleDeclarationImpl` from a `ModuleDeclarationStructure`.
   * @param source - The structure to clone.
   */
  public static clone(
    source: OptionalKind<ModuleDeclarationStructure>,
  ): ModuleDeclarationImpl {
    const target = new ModuleDeclarationImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  /** @internal */
  public [GET_OUTER_TYPE](): this {
    return this;
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
