// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type OptionalKind,
  StructureKind,
  type VariableDeclarationKind,
  type VariableDeclarationStructure,
  type VariableStatementStructure
} from "ts-morph";

import {
  VariableDeclarationImpl,
} from "../../exports.mjs";

import StatementClassesMap from "../base/StatementClassesMap.mjs";

import StructureBase from "../base/StructureBase.mjs";

import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

import {
  cloneArrayOrUndefined
} from "../base/utilities.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import AmbientableNode, {
  type AmbientableNodeStructureFields
} from "../decorators/AmbientableNode.mjs";
import ExportableNode, {
  type ExportableNodeStructureFields
} from "../decorators/ExportableNode.mjs";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion preamble

const VariableStatementBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.VariableStatement>,
    AmbientableNodeStructureFields,
    ExportableNodeStructureFields,
    JSDocableNodeStructureFields,
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.VariableStatement>(StructureKind.VariableStatement),
    AmbientableNode,
    ExportableNode,
    JSDocableNode,
  ],
  StructureBase
);

export default class VariableStatementImpl
extends VariableStatementBase
implements VariableStatementStructure
{
  declarationKind?: VariableDeclarationKind | undefined = undefined;
  declarations: VariableDeclarationImpl[] = [];

  public static clone(
    other: VariableStatementStructure
  ): VariableStatementImpl
  {
    const clone = new VariableStatementImpl;

    clone.declarationKind = other.declarationKind;
    cloneArrayOrUndefined<
      OptionalKind<VariableDeclarationStructure>,
      typeof VariableDeclarationImpl
    >
    (
      other.declarations, VariableDeclarationImpl
    );

    VariableStatementBase.cloneTrivia(other, clone);
    VariableStatementBase.cloneAmbientable(other, clone);
    VariableStatementBase.cloneExportable(other, clone);
    VariableStatementBase.cloneJSDocable(other, clone);

    return clone;
  }
}
VariableStatementImpl satisfies CloneableStructure<VariableStatementStructure>;

StatementClassesMap.set(StructureKind.VariableStatement, VariableStatementImpl);
StructuresClassesMap.set(StructureKind.VariableStatement, VariableStatementImpl);
