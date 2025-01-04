// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  GeneratorableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#utilities/source/_types/Utility.js";

import type StructureBase from "../base/StructureBase.js";

// #endregion preamble

declare const GeneratorableNodeStructureKey: unique symbol;

export type GeneratorableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof GeneratorableNodeStructureKey>,
  {
    staticFields: {
      cloneGeneratorable(
        source: GeneratorableNodeStructure,
        target: Required<GeneratorableNodeStructure>,
      ): void;
    },

    instanceFields: Required<GeneratorableNodeStructure>,

    symbolKey: typeof GeneratorableNodeStructureKey
  }
>;

export default function GeneratorableNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  GeneratorableNodeStructureFields["staticFields"],
  GeneratorableNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass {
    isGenerator = false;

    static cloneGeneratorable(
      source: GeneratorableNodeStructure,
      target: Required<GeneratorableNodeStructure>
    ): void
    {
      target.isGenerator = source.isGenerator ?? false;
    }
  }
}

GeneratorableNode satisfies SubclassDecorator<
  GeneratorableNodeStructureFields,
  typeof StructureBase,
  false
>;
