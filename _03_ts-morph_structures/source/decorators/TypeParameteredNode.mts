import {
  TypeParameteredNodeStructure
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
import TypeParameterDeclarationImpl from "../structures/TypeParameterDeclarationImpl.mjs";

declare const TypeParameteredNodeStructureKey: unique symbol;

export interface TypeParametersArrayOwner {
  typeParameters: (TypeParameterDeclarationImpl | string)[];
}

export type TypeParameteredNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof TypeParameteredNodeStructureKey>,
  {
    staticFields: {
      cloneTypeParameters(
        source: TypeParameteredNodeStructure,
        target: TypeParametersArrayOwner
      ): void;
    },

    instanceFields: {
      typeParameters: (TypeParameterDeclarationImpl | string)[]
    },

    symbolKey: typeof TypeParameteredNodeStructureKey
  }
>;

export default function TypeParameteredNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  TypeParameteredNodeStructureFields["staticFields"],
  TypeParameteredNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);

  return class extends baseClass {
    typeParameters: TypeParameterDeclarationImpl[] = [];

    static cloneTypeParameters(
      source: TypeParameteredNodeStructure,
      target: TypeParametersArrayOwner
    ): void
    {
      target.typeParameters = TypeParameterDeclarationImpl.cloneArray(source);
    }
  }
}
TypeParameteredNode satisfies SubclassDecorator<
  typeof StructureBase,
  TypeParameteredNodeStructureFields,
  false
>;
