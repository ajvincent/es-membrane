import type {
  QuestionTokenableNodeStructure
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

import StructureBase from "../base/StructureBase.mjs";

import type {
  MixinClass
} from "#mixin_decorators/source/types/MixinClass.mjs";

declare const QuestionTokenableNodeStructureKey: unique symbol;

export type QuestionTokenableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof QuestionTokenableNodeStructureKey>,
  {
    staticFields: {
      cloneQuestionTokenable(
        source: QuestionTokenableNodeStructure,
        target: Required<QuestionTokenableNodeStructure>,
      ): void;
    };

    instanceFields: Required<QuestionTokenableNodeStructure>;

    symbolKey: typeof QuestionTokenableNodeStructureKey;
  }
>;

export default function QuestionTokenableNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  QuestionTokenableNodeStructureFields["staticFields"],
  QuestionTokenableNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass
  {
    hasQuestionToken = false;

    static cloneQuestionTokenable(
      source: QuestionTokenableNodeStructure,
      target: Required<QuestionTokenableNodeStructure>
    ): void
    {
      target.hasQuestionToken = source.hasQuestionToken ?? false;
    }
  }
}

QuestionTokenableNode satisfies SubclassDecorator<
  typeof StructureBase,
  QuestionTokenableNodeStructureFields,
  false
>;
