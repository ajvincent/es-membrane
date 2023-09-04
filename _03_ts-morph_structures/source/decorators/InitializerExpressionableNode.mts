// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  InitializerExpressionableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import StructureBase from "../base/StructureBase.mjs";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";
// #endregion preamble

declare const InitializerExpressionableNodeStructureKey: unique symbol;

export type InitializerExpressionableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof InitializerExpressionableNodeStructureKey>,
  {
    staticFields: {
      cloneInitializerExpressionable(
        source: InitializerExpressionableNodeStructure,
        target: InitializerExpressionableNodeStructure
      ): void;
    };

    instanceFields: InitializerExpressionableNodeStructure;

    symbolKey: typeof InitializerExpressionableNodeStructureKey;
  }
>;

export default function InitializerExpressionableNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  InitializerExpressionableNodeStructureFields["staticFields"],
  InitializerExpressionableNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass {
    initializer: stringOrWriterFunction | undefined = undefined;

    static cloneInitializerExpressionable(
      source: InitializerExpressionableNodeStructure,
      target: InitializerExpressionableNodeStructure,
    ): void
    {
      target.initializer = source.initializer;
    }
  }
}
InitializerExpressionableNode satisfies SubclassDecorator<
  InitializerExpressionableNodeStructureFields,
  typeof StructureBase,
  false
>;
