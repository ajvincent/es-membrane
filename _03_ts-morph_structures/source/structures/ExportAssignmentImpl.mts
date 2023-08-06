import {
  ExportAssignmentStructure,
  StructureKind,
}from "ts-morph";

import StatementClassesMap from "./StatementClassesMap.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.mjs";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "../decorators/StructureBase.mjs";
import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
import { stringOrWriterFunction } from "../types/ts-morph-native.mjs";

const ExportAssignmentBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.ExportAssignment>,
    JSDocableNodeStructureFields,
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.ExportAssignment>(StructureKind.ExportAssignment),
    JSDocableNode
  ],
  StructureBase
);

export default class ExportAssignmentImpl
extends ExportAssignmentBase
implements Required<ExportAssignmentStructure>
{
  expression: stringOrWriterFunction;
  isExportEquals = false;

  constructor(
    expression: stringOrWriterFunction
  )
  {
    super();
    this.expression = expression;
  }

  public static clone(
    other: ExportAssignmentStructure
  ): ExportAssignmentImpl
  {
    const clone = new ExportAssignmentImpl(other.expression);

    ExportAssignmentBase.cloneTrivia(other, clone);
    ExportAssignmentBase.cloneJSDocable(other, clone);

    return clone;
  }
}
ExportAssignmentImpl satisfies CloneableStructure<ExportAssignmentStructure>;

StatementClassesMap.set(StructureKind.ExportAssignment, ExportAssignmentImpl);
