// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  Scope,
  ScopedNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#utilities/source/_types/Utility.js";

import type StructureBase from "../base/StructureBase.js";
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
  ScopedNodeStructureFields,
  typeof StructureBase,
  false
>;
