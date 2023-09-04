// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type SourceFileStructure,
  StructureKind,
} from "ts-morph";

import StructureBase from "../base/StructureBase.mjs";

import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import StatementedNode, {
  type StatementedNodeStructureFields
} from "../decorators/StatementedNode.mjs";

import type {
  CloneableStructure,
} from "../types/CloneableStructure.mjs";
// #endregion preamble

const SourceFileBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.SourceFile>,
    StatementedNodeStructureFields
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.SourceFile>(StructureKind.SourceFile),
    StatementedNode
  ],
  StructureBase
);

export default class SourceFileImpl
extends SourceFileBase
implements SourceFileStructure
{
  public static clone(
    other: SourceFileStructure
  ): SourceFileImpl
  {
    const clone = new SourceFileImpl;

    SourceFileBase.cloneTrivia(other, clone);
    SourceFileBase.cloneStatemented(other, clone);

    return clone;
  }
}

SourceFileImpl satisfies CloneableStructure<SourceFileStructure>;

StructuresClassesMap.set(StructureKind.SourceFile, SourceFileImpl);
