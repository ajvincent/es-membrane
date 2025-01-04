// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type OptionalKind,
  StructureKind,
  type TypeAliasDeclarationStructure,
  type WriterFunction,
} from "ts-morph";

import StatementClassesMap from "../base/StatementClassesMap.js";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import AmbientableNode, {
  type AmbientableNodeStructureFields
} from "../decorators/AmbientableNode.js";
import ExportableNode, {
  type ExportableNodeStructureFields
} from "../decorators/ExportableNode.js";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.js";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.js";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.js";
import TypedNode, {
  type TypedNodeStructureFields
} from "../decorators/TypedNode.js";

import type {
  CloneableStructure,
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
import { replaceWriterWithString } from "../base/utilities.js";
import { stringOrWriterFunction } from "../exports.js";
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
    name: string,
    type?: stringOrWriterFunction
  )
  {
    super();
    this.name = name;
    if (type) {
      this.type = type;
    }
  }

  get type(): string | WriterFunction
  {
    return super.type ?? "";
  }

  set type(value: string | WriterFunction)
  {
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

  public toJSON(): ReplaceWriterInProperties<TypeAliasDeclarationStructure>
  {
    const rv = super.toJSON() as ReplaceWriterInProperties<TypeAliasDeclarationStructure>;
    rv.type = replaceWriterWithString(this.type);
    return rv;
  }
}
TypeAliasDeclarationImpl satisfies CloneableStructure<TypeAliasDeclarationStructure>;

StatementClassesMap.set(StructureKind.TypeAlias, TypeAliasDeclarationImpl);
StructuresClassesMap.set(StructureKind.TypeAlias, TypeAliasDeclarationImpl);
