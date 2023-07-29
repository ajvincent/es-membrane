import type {
  StatementStructures,
  StatementedNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import type {
  SubclassDecorator
} from "#mixin_decorators/source/types/SubclassDecorator.mjs";

import StructureBase from "./StructureBase.mjs";

import type {
  MixinClass
} from "#mixin_decorators/source/types/MixinClass.mjs";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";
import { statementsArray } from "../structures/utilities.mjs";

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
  typeof StructureBase,
  StatementedNodeStructureFields,
  false
>;
