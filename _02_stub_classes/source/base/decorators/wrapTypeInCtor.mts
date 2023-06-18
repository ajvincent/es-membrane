// #region preamble
import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#stage_utilities/source/types/StaticAndInstance.mjs";

import type {
  ConfigureStubDecorator
} from "../types/ConfigureStubDecorator.mjs";

import type {
  TS_Method
} from "../../types/export-types.mjs";

// #endregion preamble

declare const WrapTypeKey: unique symbol;

export type WrapTypeInCtorFields = RightExtendsLeft<StaticAndInstance<typeof WrapTypeKey>, {
  staticFields: object,
  instanceFields: object,
  symbolKey: typeof WrapTypeKey,
}>;

const WrapTypeInCtorDecorator: ConfigureStubDecorator<WrapTypeInCtorFields, false> = function(
  this: void,
  baseClass
)
{
  return class WrapType extends baseClass {
    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean,
    ) : void
    {
      super.methodTrap(methodStructure, isBefore);
      if (methodStructure || !isBefore)
        return;

      /*
      this.classWriter.writeLine(
        `static readonly [SPY_BASE] = new WeakMap<${this.getClassName()}, ${this.interfaceOrAliasName}>;`
      );
      */
      this.classWriter.writeLine(`readonly #wrapped: ${this.interfaceOrAliasName}`);
      this.classWriter.newLine();

      this.classWriter.write(`constructor(wrapped: ${this.interfaceOrAliasName}) `);
      this.classWriter.block(() => {
        this.classWriter.writeLine(`this.#wrapped = wrapped;`);
      });

      this.classWriter.newLine();
      this.classWriter.newLine();
    }
  }
}

export default WrapTypeInCtorDecorator;
