// #region
import {
  type IndexSignatureDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";

import StructureBase from "../base/StructureBase.mjs";

import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.mjs";
import ReadonlyableNode, {
  type ReadonlyableNodeStructureFields
} from "../decorators/ReadonlyableNode.mjs";
import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields,
} from "../decorators/ReturnTypedNode.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion

const IndexSignatureDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.IndexSignature>,
    JSDocableNodeStructureFields,
    ReadonlyableNodeStructureFields,
    ReturnTypedNodeStructureFields,
  ], typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.IndexSignature>(StructureKind.IndexSignature),
    JSDocableNode,
    ReadonlyableNode,
    ReturnTypedNode,
  ],
  StructureBase
);

export default class IndexSignatureDeclarationImpl
extends IndexSignatureDeclarationBase
implements IndexSignatureDeclarationStructure
{
  keyName: string | undefined;
  keyType: string | undefined;

  public static clone(
    other: OptionalKind<IndexSignatureDeclarationStructure>
  ): IndexSignatureDeclarationImpl
  {
    const clone = new IndexSignatureDeclarationImpl;

    clone.keyName = other.keyName;
    clone.keyType = other.keyType;

    IndexSignatureDeclarationBase.cloneTrivia(other, clone);
    IndexSignatureDeclarationBase.cloneJSDocable(other, clone);
    IndexSignatureDeclarationBase.cloneReadonlyable(other, clone);
    IndexSignatureDeclarationBase.cloneReturnTyped(other, clone);

    return clone;
  }
}
IndexSignatureDeclarationImpl satisfies CloneableStructure<IndexSignatureDeclarationStructure>;

StructuresClassesMap.set(StructureKind.IndexSignature, IndexSignatureDeclarationImpl);
