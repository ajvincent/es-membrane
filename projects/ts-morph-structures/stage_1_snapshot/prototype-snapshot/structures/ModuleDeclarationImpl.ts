// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  ModuleDeclarationKind,
  type ModuleDeclarationStructure,
  StructureKind,
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
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.js";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.js";
import StatementedNode, {
  type StatementedNodeStructureFields
} from "../decorators/StatementedNode.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
// #endregion preamble

const ModuleDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.Module>,
    AmbientableNodeStructureFields,
    ExportableNodeStructureFields,
    JSDocableNodeStructureFields,
    NamedNodeStructureFields,
    StatementedNodeStructureFields,
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.Module>(StructureKind.Module),
    AmbientableNode,
    ExportableNode,
    JSDocableNode,
    NamedNode,
    StatementedNode,
  ],
  StructureBase
);

export default class ModuleDeclarationImpl
extends ModuleDeclarationBase
implements ModuleDeclarationStructure
{
  declarationKind: ModuleDeclarationKind | undefined = undefined;

  constructor(
    name: string
  )
  {
    super();
    this.name = name;
  }

  public static clone(
    other: ModuleDeclarationStructure
  ): ModuleDeclarationImpl
  {
    const clone = new ModuleDeclarationImpl(other.name);
    clone.declarationKind = other.declarationKind;

    ModuleDeclarationBase.cloneTrivia(other, clone);
    ModuleDeclarationBase.cloneAmbientable(other, clone);
    ModuleDeclarationBase.cloneExportable(other, clone);
    ModuleDeclarationBase.cloneJSDocable(other, clone);
    ModuleDeclarationBase.cloneStatemented(other, clone);

    return clone;
  }

  public toJSON(): ReplaceWriterInProperties<ModuleDeclarationStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<ModuleDeclarationStructure>;
  }
}

ModuleDeclarationImpl satisfies CloneableStructure<ModuleDeclarationStructure>;

StatementClassesMap.set(StructureKind.Module, ModuleDeclarationImpl);
StructuresClassesMap.set(StructureKind.Module, ModuleDeclarationImpl);
