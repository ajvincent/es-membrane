import {
  JSDocableNodeStructure,
} from "ts-morph"

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
import { MixinClass } from "#mixin_decorators/source/types/MixinClass.mjs";
import JSDocImpl from "../structures/JSDocImpl.mjs";

declare const JSDocableNodeStructureKey: unique symbol;

export interface JSDocsArrayOwner {
  docs: (string | JSDocImpl)[];
}

export type JSDocableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof JSDocableNodeStructureKey>,
  {
    staticFields: {
      cloneJSDocable(
        source: JSDocableNodeStructure,
        target: JSDocsArrayOwner
      ): void;
    },

    instanceFields: {
      docs: (string | JSDocImpl)[];
    },

    symbolKey: typeof JSDocableNodeStructureKey
  }
>;

export default function JSDocableNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  JSDocableNodeStructureFields["staticFields"],
  JSDocableNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass {
    docs: (string | JSDocImpl)[] = [];

    static cloneJSDocable(
      source: JSDocableNodeStructure,
      target: JSDocsArrayOwner
    ): void
    {
      target.docs = JSDocImpl.cloneArray(source);
    }
  }
}

JSDocableNode satisfies SubclassDecorator<
  typeof StructureBase,
  JSDocableNodeStructureFields,
  false
>;
