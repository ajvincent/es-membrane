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
} from "../exports.js";

import StatementClassesMap from "../base/StatementClassesMap.js";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import {
  cloneArrayOrUndefined
} from "../base/utilities.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import AmbientableNode, {
  type AmbientableNodeStructureFields
} from "../decorators/AmbientableNode.js";
import ExportableNode, {
  type ExportableNodeStructureFields
} from "../decorators/ExportableNode.js";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
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

  public toJSON(): ReplaceWriterInProperties<VariableStatementStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<VariableStatementStructure>;
  }
}
VariableStatementImpl satisfies CloneableStructure<VariableStatementStructure>;

StatementClassesMap.set(StructureKind.VariableStatement, VariableStatementImpl);
StructuresClassesMap.set(StructureKind.VariableStatement, VariableStatementImpl);
