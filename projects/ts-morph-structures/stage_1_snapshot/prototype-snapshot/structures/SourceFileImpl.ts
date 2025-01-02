// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type SourceFileStructure,
  StructureKind,
} from "ts-morph";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import StatementedNode, {
  type StatementedNodeStructureFields
} from "../decorators/StatementedNode.js";

import type {
  CloneableStructure,
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
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

  public toJSON(): ReplaceWriterInProperties<SourceFileStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<SourceFileStructure>;
  }
}

SourceFileImpl satisfies CloneableStructure<SourceFileStructure>;

StructuresClassesMap.set(StructureKind.SourceFile, SourceFileImpl);
