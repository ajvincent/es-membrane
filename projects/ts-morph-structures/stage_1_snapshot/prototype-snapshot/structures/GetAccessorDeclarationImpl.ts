// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type GetAccessorDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import AbstractableNode, {
  type AbstractableNodeStructureFields
} from "../decorators/AbstractableNode.js";
import DecoratableNode, {
  type DecoratableNodeStructureFields
} from "../decorators/DecoratableNode.js";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.js";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.js";
import ParameteredNode, {
  type ParameteredNodeStructureFields,
} from "../decorators/ParameteredNode.js";
import StaticableNode, {
  type StaticableNodeStructureFields
} from "../decorators/StaticableNode.js";
import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields,
} from "../decorators/ReturnTypedNode.js";
import ScopedNode, {
  type ScopedNodeStructureFields
} from "../decorators/ScopedNode.js";
import StatementedNode, {
  type StatementedNodeStructureFields
} from "../decorators/StatementedNode.js";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields,
} from "../decorators/TypeParameteredNode.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
// #endregion preamble

const GetAccessorDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.GetAccessor>,
    AbstractableNodeStructureFields,
    DecoratableNodeStructureFields,
    JSDocableNodeStructureFields,
    NamedNodeStructureFields,
    ParameteredNodeStructureFields,
    ReturnTypedNodeStructureFields,
    ScopedNodeStructureFields,
    StaticableNodeStructureFields,
    StatementedNodeStructureFields,
    TypeParameteredNodeStructureFields,
  ], typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.GetAccessor>(StructureKind.GetAccessor),
    AbstractableNode,
    DecoratableNode,
    JSDocableNode,
    NamedNode,
    ParameteredNode,
    ReturnTypedNode,
    ScopedNode,
    StaticableNode,
    StatementedNode,
    TypeParameteredNode,
  ],
  StructureBase
);

export default class GetAccessorDeclarationImpl
extends GetAccessorDeclarationBase
implements GetAccessorDeclarationStructure
{
  constructor(
    name: string
  )
  {
    super();
    this.name = name;
  }

  public static clone(
    other: OptionalKind<GetAccessorDeclarationStructure>
  ): GetAccessorDeclarationImpl
  {
    const clone = new GetAccessorDeclarationImpl(other.name);

    GetAccessorDeclarationBase.cloneTrivia(other, clone);
    GetAccessorDeclarationBase.cloneAbstractable(other, clone);
    GetAccessorDeclarationBase.cloneDecoratable(other, clone);
    GetAccessorDeclarationBase.cloneJSDocable(other, clone);
    GetAccessorDeclarationBase.cloneParametered(other, clone);
    GetAccessorDeclarationBase.cloneReturnTyped(other, clone);
    GetAccessorDeclarationBase.cloneScoped(other, clone);
    GetAccessorDeclarationBase.cloneStaticable(other, clone);
    GetAccessorDeclarationBase.cloneStatemented(other, clone);
    GetAccessorDeclarationBase.cloneTypeParametered(other, clone);

    return clone;
  }

  public toJSON(): ReplaceWriterInProperties<GetAccessorDeclarationStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<GetAccessorDeclarationStructure>;
  }
}
GetAccessorDeclarationImpl satisfies CloneableStructure<GetAccessorDeclarationStructure>;

StructuresClassesMap.set(StructureKind.GetAccessor, GetAccessorDeclarationImpl);
