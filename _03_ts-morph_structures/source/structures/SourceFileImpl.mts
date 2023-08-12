import {
  type SourceFileStructure,
  StructureKind,
} from "ts-morph";


import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import StatementedNode, {
  type StatementedNodeStructureFields
} from "../decorators/StatementedNode.mjs";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "../decorators/StructureBase.mjs";
import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

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
