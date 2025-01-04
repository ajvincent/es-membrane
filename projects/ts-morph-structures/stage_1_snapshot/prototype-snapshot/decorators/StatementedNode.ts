// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  StatementStructures,
  StatementedNodeStructure,
  Structure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#utilities/source/_types/Utility.js";

import type StructureBase from "../base/StructureBase.js";
import {
  replaceWriterWithString,
  statementsArray
} from "../base/utilities.js";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.js";

import {
  ReplaceWriterInProperties
} from "../types/ModifyWriterInTypes.js";
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
    readonly statements: (stringOrWriterFunction | StatementStructures)[] = [];

    static cloneStatemented(
      source: StatementedNodeStructure,
      target: StatementsArrayOwner
    ): void
    {
      target.statements = statementsArray(source);
    }

    public toJSON(): ReplaceWriterInProperties<StatementedNodeStructure & Structure>
    {
      const rv = super.toJSON() as ReplaceWriterInProperties<StatementedNodeStructure>;
      rv.statements = this.statements.map(value => {
        if (typeof value === "object") {
          return value;
        }
        return replaceWriterWithString<string>(value);
      });

      return rv;
    }
  }
}

StatementedNode satisfies SubclassDecorator<
  StatementedNodeStructureFields,
  typeof StructureBase,
  false
>;
