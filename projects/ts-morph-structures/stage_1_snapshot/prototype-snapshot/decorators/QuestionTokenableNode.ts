// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  QuestionTokenableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#utilities/source/_types/Utility.js";


import type StructureBase from "../base/StructureBase.js";
// #endregion preamble

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
  QuestionTokenableNodeStructureFields,
  typeof StructureBase,
  false
>;
