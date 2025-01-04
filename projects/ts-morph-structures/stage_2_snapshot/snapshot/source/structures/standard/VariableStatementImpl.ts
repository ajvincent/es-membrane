//#region preamble
import type {
  VariableDeclarationImpl,
  VariableStatementStructureClassIfc,
} from "../../exports.js";
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
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type OptionalKind,
  StructureKind,
  type VariableDeclarationKind,
  type VariableDeclarationStructure,
  type VariableStatementStructure,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const VariableStatementStructureBase = MultiMixinBuilder<
  [
    ExportableNodeStructureFields,
    AmbientableNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    ExportableNodeStructureMixin,
    AmbientableNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export default class VariableStatementImpl
  extends VariableStatementStructureBase
  implements VariableStatementStructureClassIfc
{
  readonly kind: StructureKind.VariableStatement =
    StructureKind.VariableStatement;
  declarationKind?: VariableDeclarationKind = undefined;
  readonly declarations: VariableDeclarationImpl[] = [];

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<VariableStatementStructure>,
    target: VariableStatementImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source.declarationKind) {
      target.declarationKind = source.declarationKind;
    }

    target.declarations.push(
      ...StructureClassesMap.cloneArrayWithKind<
        VariableDeclarationStructure,
        StructureKind.VariableDeclaration,
        VariableDeclarationImpl
      >(
        StructureKind.VariableDeclaration,
        StructureClassesMap.forceArray(source.declarations),
      ),
    );
  }

  public static clone(
    source: OptionalKind<VariableStatementStructure>,
  ): VariableStatementImpl {
    const target = new VariableStatementImpl();
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<VariableStatementImpl> {
    const rv = super.toJSON() as StructureClassToJSON<VariableStatementImpl>;
    if (this.declarationKind) {
      rv.declarationKind = this.declarationKind;
    } else {
      rv.declarationKind = undefined;
    }

    rv.declarations = this.declarations;
    rv.kind = this.kind;
    return rv;
  }
}

VariableStatementImpl satisfies CloneableStructure<
  VariableStatementStructure,
  VariableStatementImpl
> &
  Class<ExtractStructure<VariableStatementStructure["kind"]>>;
StructureClassesMap.set(StructureKind.VariableStatement, VariableStatementImpl);
