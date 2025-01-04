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
} from "#utilities/source/_types/Utility.js";

import type StructureBase from "../base/StructureBase.js";
import JSDocImpl from "../structures/JSDocImpl.js";
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
