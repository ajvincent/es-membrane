// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  StatementStructures,
  StatementedNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import StructureBase from "../base/StructureBase.mjs";
import {
  statementsArray
} from "../base/utilities.mjs";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";
// #endregion preamble

declare const StatementedNodeStructureKey: unique symbol;

export interface StatementsArrayOwner {
  statements: (stringOrWriterFunction | StatementStructures)[];
}

export type StatementedNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof StatementedNodeStructureKey>,
  {
    staticFields: {
      cloneStatemented(
        source: StatementedNodeStructure,
        target: StatementsArrayOwner
      ): void;
    };

    instanceFields: StatementsArrayOwner;

    symbolKey: typeof StatementedNodeStructureKey;
  }
>;

export default function StatementedNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  StatementedNodeStructureFields["staticFields"],
  StatementedNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass {
    statements: (stringOrWriterFunction | StatementStructures)[] = [];

    static cloneStatemented(
      source: StatementedNodeStructure,
      target: StatementsArrayOwner
    ): void
    {
      target.statements = statementsArray(source);
    }
  }
}

StatementedNode satisfies SubclassDecorator<
  StatementedNodeStructureFields,
  typeof StructureBase,
  false
>;
