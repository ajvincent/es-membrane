// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type FunctionDeclarationStructure,
  type FunctionDeclarationOverloadStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import {
  FunctionDeclarationOverloadImpl
} from "../exports.js";

import StructureBase from "../base/StructureBase.js";

import StatementClassesMap from "../base/StatementClassesMap.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import {
  cloneArrayOrUndefined,
} from "../base/utilities.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import AmbientableNode, {
  type AmbientableNodeStructureFields
} from "../decorators/AmbientableNode.js";
import AsyncableNode, {
  type AsyncableNodeStructureFields
} from "../decorators/AsyncableNode.js";
import ExportableNode, {
  type ExportableNodeStructureFields
} from "../decorators/ExportableNode.js";
import GeneratorableNode, {
  type GeneratorableNodeStructureFields
} from "../decorators/GeneratorableNode.js";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.js";
import NameableNode, {
  type NameableNodeStructureFields
} from "../decorators/NameableNode.js";
import ParameteredNode, {
  type ParameteredNodeStructureFields
} from "../decorators/ParameteredNode.js";
import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields
} from "../decorators/ReturnTypedNode.js";
import StatementedNode, {
  type StatementedNodeStructureFields
} from "../decorators/StatementedNode.js";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
// #endregion preamble

const FunctionDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.Function>,
    AmbientableNodeStructureFields,
    AsyncableNodeStructureFields,
    ExportableNodeStructureFields,
    GeneratorableNodeStructureFields,
    JSDocableNodeStructureFields,
    NameableNodeStructureFields,
    ParameteredNodeStructureFields,
    ReturnTypedNodeStructureFields,
    StatementedNodeStructureFields,
    TypeParameteredNodeStructureFields,
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.Function>(StructureKind.Function),
    AmbientableNode,
    AsyncableNode,
    ExportableNode,
    GeneratorableNode,
    JSDocableNode,
    NameableNode,
    ParameteredNode,
    ReturnTypedNode,
    StatementedNode,
    TypeParameteredNode,
  ],
  StructureBase
);

export default class FunctionDeclarationImpl
extends FunctionDeclarationBase
implements FunctionDeclarationStructure
{
  overloads: FunctionDeclarationOverloadImpl[] = [];

  public static clone(
    other: FunctionDeclarationStructure
  ): FunctionDeclarationImpl
  {
    const clone = new FunctionDeclarationImpl;

    clone.overloads = cloneArrayOrUndefined<
      OptionalKind<FunctionDeclarationOverloadStructure>,
      typeof FunctionDeclarationOverloadImpl
    >
    (
      other.overloads,
      FunctionDeclarationOverloadImpl
    );

    FunctionDeclarationBase.cloneTrivia(other, clone);
    FunctionDeclarationBase.cloneAmbientable(other, clone);
    FunctionDeclarationBase.cloneAsyncable(other, clone);
    FunctionDeclarationBase.cloneExportable(other, clone);
    FunctionDeclarationBase.cloneGeneratorable(other, clone);
    FunctionDeclarationBase.cloneJSDocable(other, clone);
    FunctionDeclarationBase.cloneNameable(other, clone);
    FunctionDeclarationBase.cloneParametered(other, clone);
    FunctionDeclarationBase.cloneReturnTyped(other, clone);
    FunctionDeclarationBase.cloneStatemented(other, clone);
    FunctionDeclarationBase.cloneTypeParametered(other, clone);

    return clone;
  }

  public toJSON(): ReplaceWriterInProperties<FunctionDeclarationStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<FunctionDeclarationStructure>;
  }
}
FunctionDeclarationImpl satisfies CloneableStructure<FunctionDeclarationStructure>;

StatementClassesMap.set(StructureKind.Function, FunctionDeclarationImpl);
StructuresClassesMap.set(StructureKind.Function, FunctionDeclarationImpl);
