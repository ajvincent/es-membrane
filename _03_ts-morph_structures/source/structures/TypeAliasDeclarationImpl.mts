// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type OptionalKind,
  StructureKind,
  type TypeAliasDeclarationStructure,
  type WriterFunction,
} from "ts-morph";

import StatementClassesMap from "../base/StatementClassesMap.mjs";

import StructureBase from "../base/StructureBase.mjs";

import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import AmbientableNode, {
  type AmbientableNodeStructureFields
} from "../decorators/AmbientableNode.mjs";
import ExportableNode, {
  type ExportableNodeStructureFields
} from "../decorators/ExportableNode.mjs";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.mjs";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.mjs";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.mjs";
import TypedNode, {
  type TypedNodeStructureFields
} from "../decorators/TypedNode.mjs";

import type {
  CloneableStructure,
} from "../types/CloneableStructure.mjs";
// #endregion preamble

const TypeAliasDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.TypeAlias>,
    AmbientableNodeStructureFields,
    ExportableNodeStructureFields,
    JSDocableNodeStructureFields,
    NamedNodeStructureFields,
    TypedNodeStructureFields,
    TypeParameteredNodeStructureFields,
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.TypeAlias>(StructureKind.TypeAlias),
    AmbientableNode,
    ExportableNode,
    JSDocableNode,
    NamedNode,
    TypedNode,
    TypeParameteredNode,
  ],
  StructureBase
);

export default class TypeAliasDeclarationImpl
extends TypeAliasDeclarationBase
implements TypeAliasDeclarationStructure
{
  constructor(
    name: string
  )
  {
    super();
    this.name = name;
  }

  get type(): string | WriterFunction
  {
    return super.type ?? "";
  }

  set type(value: string | WriterFunction) {
    super.type = value;
  }

  public static clone(
    other: OptionalKind<TypeAliasDeclarationStructure>
  ): TypeAliasDeclarationImpl
  {
    const clone = new TypeAliasDeclarationImpl(other.name);

    TypeAliasDeclarationBase.cloneTrivia(other, clone);
    TypeAliasDeclarationBase.cloneAmbientable(other, clone);
    TypeAliasDeclarationBase.cloneExportable(other, clone);
    TypeAliasDeclarationBase.cloneJSDocable(other, clone);
    TypeAliasDeclarationBase.cloneTyped(other, clone);
    TypeAliasDeclarationBase.cloneTypeParametered(other, clone);

    return clone;
  }
}
TypeAliasDeclarationImpl satisfies CloneableStructure<TypeAliasDeclarationStructure>;

StatementClassesMap.set(StructureKind.TypeAlias, TypeAliasDeclarationImpl);
StructuresClassesMap.set(StructureKind.TypeAlias, TypeAliasDeclarationImpl);
