// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import {
  JSDocableNodeStructure,
} from "ts-morph"

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import StructureBase from "../base/StructureBase.mjs";
import JSDocImpl from "../structures/JSDocImpl.mjs";
// #endregion preamble

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
  JSDocableNodeStructureFields,
  typeof StructureBase,
  false
>;
