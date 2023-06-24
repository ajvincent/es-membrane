// #region preamble
import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import type {
  AspectsStubDecorator
} from "../types/AspectsStubDecorator.mjs";

import type {
  TS_Method,
  TS_Parameter,
} from "../types/ts-morph-native.mjs";

// #endregion preamble

declare const NotImplementedKey: unique symbol;

export type NotImplementedFields = RightExtendsLeft<StaticAndInstance<typeof NotImplementedKey>, {
  staticFields: object,
  instanceFields: {
    setNotImplementedOnly(useNever: boolean) : void;
  },
  symbolKey: typeof NotImplementedKey
}>

const NotImplementedDecorator: AspectsStubDecorator<NotImplementedFields> = function NotImplementedDecorator(
  this: void,
  baseClass
)
{
  return class NotImplemented extends baseClass {
    protected buildMethodBodyTrap(
      methodStructure: TS_Method,
      remainingArgs: Set<TS_Parameter>,
    ): void
    {
      this.voidArguments(remainingArgs);
      super.buildMethodBodyTrap(methodStructure, remainingArgs);

      this.classWriter.writeLine(`throw new Error("not yet implemented");`);
    }
  }
}

export default NotImplementedDecorator;
