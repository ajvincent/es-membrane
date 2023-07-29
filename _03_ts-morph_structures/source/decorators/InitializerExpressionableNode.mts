import type {
  InitializerExpressionableNodeStructure
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
import { stringOrWriterFunction } from "../types/ts-morph-native.mjs";

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
  typeof StructureBase,
  InitializerExpressionableNodeStructureFields,
  false
>;
