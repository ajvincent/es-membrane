import {
  type OptionalKind,
  StructureKind,
  EnumDeclarationStructure,
  EnumMemberStructure,
} from "ts-morph";

import {
  cloneArrayOrUndefined,
} from "./utilities.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";

import StatementClassesMap from "./StatementClassesMap.mjs";
import EnumMemberImpl from "./EnumMemberImpl.mjs";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "../decorators/StructureBase.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import AmbientableNode, {
  type AmbientableNodeStructureFields
} from "../decorators/AmbientableNode.mjs";
import ExportableNode, {
  type ExportableNodeStructureFields
} from "../decorators/ExportableNode.mjs";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.mjs";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.mjs";
import StructuresClassesMap from "./StructuresClassesMap.mjs";

const EnumDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.Enum>,
    AmbientableNodeStructureFields,
    ExportableNodeStructureFields,
    JSDocableNodeStructureFields,
    NamedNodeStructureFields,
  ], typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.Enum>(StructureKind.Enum),
    AmbientableNode,
    ExportableNode,
    JSDocableNode,
    NamedNode,
  ],
  StructureBase
)
export default class EnumDeclarationImpl
extends EnumDeclarationBase
implements EnumDeclarationStructure
{
  isConst = false;
  members: EnumMemberImpl[] = [];

  constructor(
    name: string
  )
  {
    super();
    this.name = name;
  }

  public static clone(
    other: EnumDeclarationStructure
  ): EnumDeclarationImpl
  {
    const clone = new EnumDeclarationImpl(other.name);

    EnumDeclarationBase.cloneTrivia(other, clone);
    EnumDeclarationBase.cloneAmbientable(other, clone);
    EnumDeclarationBase.cloneExportable(other, clone);
    EnumDeclarationBase.cloneJSDocable(other, clone);
    EnumDeclarationBase.cloneNamed(other, clone);

    clone.isConst = other.isConst ?? false;
    clone.members = cloneArrayOrUndefined<OptionalKind<EnumMemberStructure>, typeof EnumMemberImpl>(
      other.members, EnumMemberImpl
    );

    return clone;
  }
}
EnumDeclarationImpl satisfies CloneableStructure<EnumDeclarationStructure>;

StatementClassesMap.set(StructureKind.Enum, EnumDeclarationImpl);
StructuresClassesMap.set(StructureKind.Enum, EnumDeclarationImpl);
