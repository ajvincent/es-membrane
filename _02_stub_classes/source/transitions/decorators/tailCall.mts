// #region preamble

import {
  OptionalKind,
  ParameterDeclarationStructure,
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#stage_utilities/source/types/StaticAndInstance.mjs";

import type {
  ConfigureStubDecorator
} from "../../base/types/ConfigureStubDecorator.mjs"

import type {
  TS_Method,
} from "../../base/types/private-types.mjs";

// #endregion preamble

export type TailCallFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: object,
}>;

const TransitionsTailCallDecorator: ConfigureStubDecorator<TailCallFields> = function(
  this: void,
  baseClass
)
{
  return class TransitionsTail extends baseClass {
    #headParameterCount = 0;

    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void {
      if (methodStructure) {
        this.#headParameterCount = methodStructure.parameters?.length ?? 0;
      }
      else if (isBefore) {
        this.#writeHandlerAndConstructor();
      }

      super.methodTrap(methodStructure, isBefore);
    }

    #writeHandlerAndConstructor() : void
    {
      this.classWriter.writeLine(`
  readonly #nextHandler: ${this.interfaceOrAliasName};
      `.trim());
      this.classWriter.newLine();
  
      TransitionsTail.pairedWrite(
        this.classWriter,
        "constructor(",
        ")",
        false,
        true,
        () => {
          this.classWriter.writeLine(`
  nextHandler: ${this.interfaceOrAliasName},
          `.trim())
        }
      );
  
      this.classWriter.newLine();
      this.classWriter.block(() => {
        this.classWriter.writeLine("this.#nextHandler = nextHandler;");
      });
      this.classWriter.newLine();
      this.classWriter.newLine();
    }

    protected buildMethodBody(
      methodStructure: TS_Method,
      remainingArgs: Set<OptionalKind<ParameterDeclarationStructure>>,
    ): void
    {
      const tailParams = methodStructure.parameters?.slice(
        -this.#headParameterCount
      ) || [];

      tailParams.forEach(param => remainingArgs.delete(param));
      this.voidArguments(remainingArgs);

      this.classWriter.writeLine(
        `return this.#nextHandler.${methodStructure.name}(${
          tailParams.map(param => param.name).join(", ")
        });`
      );
    }
  }
}

export default TransitionsTailCallDecorator;
