// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type ExportAssignmentStructure,
  StructureKind,
} from "ts-morph";

import StatementClassesMap from "../base/StatementClassesMap.js";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
import { replaceWriterWithString } from "../base/utilities.js";
// #endregion preamble

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

  public toJSON(): ReplaceWriterInProperties<ExportAssignmentStructure>
  {
    const rv = super.toJSON() as ReplaceWriterInProperties<ExportAssignmentStructure>;
    rv.expression = replaceWriterWithString(this.expression);
    return rv;
  }
}
ExportAssignmentImpl satisfies CloneableStructure<ExportAssignmentStructure>;

StatementClassesMap.set(StructureKind.ExportAssignment, ExportAssignmentImpl);
StructuresClassesMap.set(StructureKind.ExportAssignment, ExportAssignmentImpl);
