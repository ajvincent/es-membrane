// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type FunctionDeclarationOverloadStructure,
  StructureKind
} from "ts-morph";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

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
import ParameteredNode, {
  type ParameteredNodeStructureFields
} from "../decorators/ParameteredNode.js";
import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields,
} from "../decorators/ReturnTypedNode.js";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
// #endregion preamble

const FunctionDeclarationOverloadBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.FunctionOverload>,
    AmbientableNodeStructureFields,
    AsyncableNodeStructureFields,
    ExportableNodeStructureFields,
    GeneratorableNodeStructureFields,
    JSDocableNodeStructureFields,
    ParameteredNodeStructureFields,
    ReturnTypedNodeStructureFields,
    TypeParameteredNodeStructureFields,
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.FunctionOverload>(StructureKind.FunctionOverload),
    AmbientableNode,
    AsyncableNode,
    ExportableNode,
    GeneratorableNode,
    JSDocableNode,
    ParameteredNode,
    ReturnTypedNode,
    TypeParameteredNode,
  ],
  StructureBase
);

export default class FunctionDeclarationOverloadImpl
extends FunctionDeclarationOverloadBase
implements FunctionDeclarationOverloadStructure
{
  public static clone(
    other: FunctionDeclarationOverloadStructure
  ): FunctionDeclarationOverloadImpl
  {
    const clone = new FunctionDeclarationOverloadImpl;

    FunctionDeclarationOverloadBase.cloneTrivia(other, clone);
    FunctionDeclarationOverloadBase.cloneAmbientable(other, clone);
    FunctionDeclarationOverloadBase.cloneAsyncable(other, clone);
    FunctionDeclarationOverloadBase.cloneExportable(other, clone);
    FunctionDeclarationOverloadBase.cloneGeneratorable(other, clone);
    FunctionDeclarationOverloadBase.cloneJSDocable(other, clone);
    FunctionDeclarationOverloadBase.cloneParametered(other, clone);
    FunctionDeclarationOverloadBase.cloneReturnTyped(other, clone);
    FunctionDeclarationOverloadBase.cloneTypeParametered(other, clone);

    return clone;
  }


  public toJSON(): ReplaceWriterInProperties<FunctionDeclarationOverloadStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<FunctionDeclarationOverloadStructure>;
  }
}
FunctionDeclarationOverloadImpl satisfies CloneableStructure<FunctionDeclarationOverloadStructure>;

StructuresClassesMap.set(StructureKind.FunctionOverload, FunctionDeclarationOverloadImpl);
