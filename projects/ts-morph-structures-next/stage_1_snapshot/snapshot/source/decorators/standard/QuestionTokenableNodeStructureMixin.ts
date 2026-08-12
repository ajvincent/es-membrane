//#region preamble
import type { QuestionTokenableNodeStructureClassIfc } from "../../exports.js";
import {
  COPY_FIELDS,
  type RightExtendsLeft,
  StructureBase,
  type StructureClassToJSON,
} from "../../internal-exports.js";
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";
import type { QuestionTokenableNodeStructure, Structures } from "ts-morph";
//#endregion preamble
declare const QuestionTokenableNodeStructureKey: unique symbol;
export type QuestionTokenableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof QuestionTokenableNodeStructureKey>,
  {
    staticFields: object;
    instanceFields: QuestionTokenableNodeStructureClassIfc;
    symbolKey: typeof QuestionTokenableNodeStructureKey;
  }
>;

export default function QuestionTokenableNodeStructureMixin(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext,
): MixinClass<
  QuestionTokenableNodeStructureFields["staticFields"],
  QuestionTokenableNodeStructureFields["instanceFields"],
  typeof StructureBase
> {
  void context;

  class QuestionTokenableNodeStructureMixin extends baseClass {
    hasQuestionToken = false;

    /** @internal */
    public static [COPY_FIELDS](
      source: QuestionTokenableNodeStructure & Structures,
      target: QuestionTokenableNodeStructureMixin & Structures,
    ): void {
      super[COPY_FIELDS](source, target);
      target.hasQuestionToken = source.hasQuestionToken ?? false;
    }

    public toJSON(): StructureClassToJSON<QuestionTokenableNodeStructureMixin> {
      const rv =
        super.toJSON() as StructureClassToJSON<QuestionTokenableNodeStructureMixin>;
      rv.hasQuestionToken = this.hasQuestionToken;
      return rv;
    }
  }

  return QuestionTokenableNodeStructureMixin;
}

QuestionTokenableNodeStructureMixin satisfies SubclassDecorator<
  QuestionTokenableNodeStructureFields,
  typeof StructureBase,
  false
>;
