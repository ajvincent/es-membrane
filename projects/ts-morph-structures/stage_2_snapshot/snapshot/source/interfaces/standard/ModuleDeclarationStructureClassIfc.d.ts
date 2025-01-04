import type { ModuleDeclarationKind, StructureKind } from "ts-morph";

export interface ModuleDeclarationStructureClassIfc {
  readonly kind: StructureKind.Module;
  /**
   * The module declaration kind.
   *
   * @remarks Defaults to "namespace".
   */
  declarationKind?: ModuleDeclarationKind;
}
