import {
  InterfaceDeclarationStructure,
  OptionalKind,
  StructureKind,
} from "ts-morph";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
import {
  stringOrWriterFunctionArray
} from "./utilities.mjs";
import StatementClassesMap from "./StatementClassesMap.mjs";

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
import TypeElementMemberedNode, {
  type TypeElementMemberedNodeStructureFields
} from "../decorators/TypeElementMemberedNode.mjs";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.mjs";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "../decorators/StructureBase.mjs";

const InterfaceDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.Interface>,
    AmbientableNodeStructureFields,
    ExportableNodeStructureFields,
    JSDocableNodeStructureFields,
    NamedNodeStructureFields,
    TypeElementMemberedNodeStructureFields,
    TypeParameteredNodeStructureFields,
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.Interface>(StructureKind.Interface),
    AmbientableNode,
    ExportableNode,
    JSDocableNode,
    NamedNode,
    TypeElementMemberedNode,
    TypeParameteredNode,
  ],
  StructureBase
);

export default class InterfaceDeclarationImpl
extends InterfaceDeclarationBase
implements InterfaceDeclarationStructure
{
  name: string;
  extends: stringOrWriterFunction[] = [];

  constructor(
    name: string
  )
  {
    super();
    this.name = name;
  }

  public static clone(
    other: OptionalKind<InterfaceDeclarationStructure>
  ): InterfaceDeclarationImpl
  {
    const clone = new InterfaceDeclarationImpl(other.name);
    clone.extends = stringOrWriterFunctionArray(other.extends);

    InterfaceDeclarationBase.cloneTrivia(other, clone);
    InterfaceDeclarationBase.cloneAmbientable(other, clone);
    InterfaceDeclarationBase.cloneExportable(other, clone);
    InterfaceDeclarationBase.cloneJSDocable(other, clone);
    InterfaceDeclarationBase.cloneTypeElementMembered(other, clone);
    InterfaceDeclarationBase.cloneTypeParametered(other, clone);

    return clone;
  }
}
InterfaceDeclarationImpl satisfies CloneableStructure<InterfaceDeclarationStructure>;

StatementClassesMap.set(StructureKind.Interface, InterfaceDeclarationImpl);
