// #region preamble
import type {
  GeneratorableNodeStructure
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
  typeof StructureBase,
  GeneratorableNodeStructureFields,
  false
>;
