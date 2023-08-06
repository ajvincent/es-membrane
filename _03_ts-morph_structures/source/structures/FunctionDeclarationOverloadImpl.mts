import {
  FunctionDeclarationOverloadStructure,
  StructureKind
} from "ts-morph";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import AmbientableNode, {
  type AmbientableNodeStructureFields
} from "../decorators/AmbientableNode.mjs";
import AsyncableNode, {
  type AsyncableNodeStructureFields
} from "../decorators/AsyncableNode.mjs";
import ExportableNode, {
  type ExportableNodeStructureFields
} from "../decorators/ExportableNode.mjs";
import GeneratorableNode, {
  type GeneratorableNodeStructureFields
} from "../decorators/GeneratorableNode.mjs";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.mjs";
import ParameteredNode, {
  type ParameteredNodeStructureFields
} from "../decorators/ParameteredNode.mjs";
import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields,
} from "../decorators/ReturnTypedNode.mjs";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.mjs";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "../decorators/StructureBase.mjs";
import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
import StructuresClassesMap from "./StructuresClassesMap.mjs";

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
}
FunctionDeclarationOverloadImpl satisfies CloneableStructure<FunctionDeclarationOverloadStructure>;

StructuresClassesMap.set(StructureKind.FunctionOverload, FunctionDeclarationOverloadImpl);
