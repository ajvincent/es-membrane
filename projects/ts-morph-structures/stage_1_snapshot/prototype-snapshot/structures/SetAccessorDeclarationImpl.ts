// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type OptionalKind,
  type SetAccessorDeclarationStructure,
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
  CloneableStructure,
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
// #endregion preamble

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

  public toJSON(): ReplaceWriterInProperties<SetAccessorDeclarationStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<SetAccessorDeclarationStructure>;
  }
}
SetAccessorDeclarationImpl satisfies CloneableStructure<SetAccessorDeclarationStructure>;

StructuresClassesMap.set(StructureKind.SetAccessor, SetAccessorDeclarationImpl);
