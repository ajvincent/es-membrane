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

import StructureClassesMap from "../base/StructureClassesMap.js";

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

import type {
  CloneableStructure,
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";

import {
  TypeStructures
} from "../typeStructures/TypeStructures.js";

import { replaceWriterWithString } from "../base/utilities.js";
import { stringOrWriterFunction } from "../exports.js";
import TypeAccessors from "../base/TypeAccessors.js";
// #endregion preamble

const TypeAliasDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.TypeAlias>,
    AmbientableNodeStructureFields,
    ExportableNodeStructureFields,
    JSDocableNodeStructureFields,
    NamedNodeStructureFields,
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
    TypeParameteredNode,
  ],
  StructureBase
);

export default class TypeAliasDeclarationImpl
extends TypeAliasDeclarationBase
implements TypeAliasDeclarationStructure
{
  static cloneTyped(
    source: OptionalKind<TypeAliasDeclarationStructure>,
    target: TypeAliasDeclarationImpl
  ): void
  {
    target.type = TypeAccessors.cloneType(source.type) as stringOrWriterFunction;
  }

  constructor(
    name: string,
    type: stringOrWriterFunction = "",
  )
  {
    super();
    this.name = name;

    this.#typeWriterManager = TypeAccessors.buildTypeAccessors(this, "type", "");
    this.type = type;
  }

  readonly #typeWriterManager: TypeAccessors;

  // overridden in constructor
  type: string | WriterFunction;

  get typeStructure(): TypeStructures | undefined
  {
    return this.#typeWriterManager.typeStructure;
  }

  set typeStructure(
    value: TypeStructures
  )
  {
    this.#typeWriterManager.typeStructure = value;
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
    TypeAliasDeclarationBase.cloneTypeParametered(other, clone);

    TypeAliasDeclarationImpl.cloneTyped(other, clone);

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
StructureClassesMap.set(StructureKind.TypeAlias, TypeAliasDeclarationImpl);
