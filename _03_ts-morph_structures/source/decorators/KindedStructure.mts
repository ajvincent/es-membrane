// #region preamble
import {
  KindedStructure,
  StructureKind
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
import { MixinClass } from "#mixin_decorators/source/types/MixinClass.mjs";
// #endregion preamble

declare const KindedStructureKey: unique symbol;

export type KindedStructureFields<TKind extends StructureKind> = RightExtendsLeft<
  StaticAndInstance<typeof KindedStructureKey>,
  {
    staticFields: object;
    instanceFields: KindedStructure<TKind>;
    symbolKey: typeof KindedStructureKey;
  }
>;

function KindedStructure<TKind extends StructureKind>(
  kind: TKind
): SubclassDecorator<typeof StructureBase, KindedStructureFields<TKind>, false>
{
  return function (
    baseClass: typeof StructureBase,
    context: ClassDecoratorContext
  ): MixinClass<
    KindedStructureFields<TKind>["staticFields"],
    KindedStructureFields<TKind>["instanceFields"],
    typeof StructureBase
  >
  {
    void(context);
    return class extends baseClass {
      readonly kind = kind;
    }
  }
}
KindedStructure satisfies SubclassDecorator<
  typeof StructureBase, KindedStructureFields<StructureKind>, [StructureKind]
>;

export default KindedStructure;
