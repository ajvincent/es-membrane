import {
  GetAccessorDeclarationStructure,
  OptionalKind,
  StructureKind,
} from "ts-morph";
import { CloneableStructure } from "../types/CloneableStructure.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import AbstractableNode, {
  type AbstractableNodeStructureFields
} from "../decorators/AbstractableNode.mjs";
import DecoratableNode, {
  type DecoratableNodeStructureFields
} from "../decorators/DecoratableNode.mjs";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.mjs";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.mjs";
import ParameteredNode, {
  type ParameteredNodeStructureFields,
} from "../decorators/ParameteredNode.mjs";
import StaticableNode, {
  type StaticableNodeStructureFields
} from "../decorators/StaticableNode.mjs";
import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields,
} from "../decorators/ReturnTypedNode.mjs";
import ScopedNode, {
  type ScopedNodeStructureFields
} from "../decorators/ScopedNode.mjs";
import StatementedNode, {
  type StatementedNodeStructureFields
} from "../decorators/StatementedNode.mjs";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields,
} from "../decorators/TypeParameteredNode.mjs";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "../decorators/StructureBase.mjs";
import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

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
}
GetAccessorDeclarationImpl satisfies CloneableStructure<GetAccessorDeclarationStructure>;

StructuresClassesMap.set(StructureKind.GetAccessor, GetAccessorDeclarationImpl);
