// #region preamble
import type {
  Scope,
  ScopedNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  MixinClass
} from "#mixin_decorators/source/types/MixinClass.mjs";

import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import type {
  SubclassDecorator
} from "#mixin_decorators/source/types/SubclassDecorator.mjs";

import StructureBase from "../base/StructureBase.mjs";
// #endregion preamble

declare const ScopedNodeStructureKey: unique symbol;

export type ScopedNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof ScopedNodeStructureKey>,
  {
    staticFields: {
      cloneScoped(
        source: ScopedNodeStructure,
        target: ScopedNodeStructure
      ): void;
    },

    instanceFields: {
      scope: Scope | undefined;
    },

    symbolKey: typeof ScopedNodeStructureKey
  }
>;

export default function ScopedNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  ScopedNodeStructureFields["staticFields"],
  ScopedNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass
  {
    scope: Scope | undefined = undefined;

    static cloneScoped(
      source: ScopedNodeStructure,
      target: ScopedNodeStructure
    ): void
    {
      target.scope = source.scope;
    }
  }
}

ScopedNode satisfies SubclassDecorator<
  typeof StructureBase,
  ScopedNodeStructureFields,
  false
>;
