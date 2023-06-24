// #region preamble
import { CodeBlockWriter } from "ts-morph";

import getRequiredInitializers from "#stage_utilities/source/RequiredInitializers.mjs";

import {
  OptionalKind,
  ParameterDeclarationStructure,
} from "ts-morph";

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
} from "../types/ts-morph-native.mjs";

// #endregion preamble

declare const TailCallKey: unique symbol;

export type TailCallFields = RightExtendsLeft<StaticAndInstance<typeof TailCallKey>, {
  staticFields: object,
  instanceFields: {
    wrapInClass(
      classArguments: string
    ): void;
  },
  symbolKey: typeof TailCallKey,
}>;

const TransitionsTailCallDecorator: AspectsStubDecorator<TailCallFields> = function(
  this: void,
  baseClass
)
{
  return class TransitionsTail extends baseClass {
    static readonly #WRAP_CLASS_KEY = "(wrap class, tail)";

    constructor(...args: unknown[]) {
      super(...args);
      getRequiredInitializers(this).add(TransitionsTail.#WRAP_CLASS_KEY);
    }

    wrapInClass(
      classArguments: string
    ): void
    {
      getRequiredInitializers(this).mayResolve(TransitionsTail.#WRAP_CLASS_KEY);

      this.wrapInFunction(
        [],
        [{
          name: "BaseClass",
          type: `Class<${
            this.interfaceOrAliasName
          }${
            classArguments ? ", " + classArguments : ""
          }>`,
        }],
        "TransitionsTailClass",
        (classWriter: CodeBlockWriter) => { void(classWriter) },
      )

      getRequiredInitializers(this).resolve(TransitionsTail.#WRAP_CLASS_KEY);
    }

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
  ...parameters: ConstructorParameters<typeof BaseClass>
          `.trim())
        }
      );

      this.classWriter.newLine();
      this.classWriter.block(() => {
        this.classWriter.writeLine("this.#nextHandler = new BaseClass(...parameters);");
      });
      this.classWriter.newLine();
      this.classWriter.newLine();
    }

    protected buildMethodBodyTrap(
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
