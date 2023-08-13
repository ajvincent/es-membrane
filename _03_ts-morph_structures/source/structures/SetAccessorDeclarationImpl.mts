import {
  OptionalKind,
  SetAccessorDeclarationStructure,
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
import StructureBase from "../base/StructureBase.mjs";
import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

const SetAccessorDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.SetAccessor>,
    AbstractableNodeStructureFields,
    DecoratableNodeStructureFields,
    JSDocableNodeStructureFields,
    NamedNodeStructureFields,
    ParameteredNodeStructureFields,
    ReturnTypedNodeStructureFields,
    ScopedNodeStructureFields,
    StaticableNodeStructureFields,
    StatementedNodeStructureFields,
    TypeParameteredNodeStructureFields
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.SetAccessor>(StructureKind.SetAccessor),
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
)

export default class SetAccessorDeclarationImpl
extends SetAccessorDeclarationBase
implements SetAccessorDeclarationStructure
{
  constructor(
    name: string
  )
  {
    super();
    this.name = name;
  }

  public static clone(
    other: OptionalKind<SetAccessorDeclarationStructure>
  ): SetAccessorDeclarationImpl
  {
    const clone = new SetAccessorDeclarationImpl(other.name);

    SetAccessorDeclarationBase.cloneTrivia(other, clone);
    SetAccessorDeclarationBase.cloneAbstractable(other, clone);
    SetAccessorDeclarationBase.cloneDecoratable(other, clone);
    SetAccessorDeclarationBase.cloneJSDocable(other, clone);
    SetAccessorDeclarationBase.cloneParametered(other, clone);
    SetAccessorDeclarationBase.cloneReturnTyped(other, clone);
    SetAccessorDeclarationBase.cloneScoped(other, clone);
    SetAccessorDeclarationBase.cloneStaticable(other, clone);
    SetAccessorDeclarationBase.cloneStatemented(other, clone);
    SetAccessorDeclarationBase.cloneTypeParametered(other, clone);

    return clone;
  }
}
SetAccessorDeclarationImpl satisfies CloneableStructure<SetAccessorDeclarationStructure>;

StructuresClassesMap.set(StructureKind.SetAccessor, SetAccessorDeclarationImpl);
