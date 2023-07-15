// #region preamble
import {
  CodeBlockWriter,
} from "ts-morph";

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
    /**
     * Wrap the class in a function, taking a base class and an invariants array for all instances.
     * @param classArguments - constructor argument types for the class.
     */
    wrapClass(
      classArguments: string,
    ): void;
  },
  symbolKey: typeof TailCallKey,
}>;

/**
 * @remarks
 *
 * "Tail" transition classes have head, middle and tail parameters, but forward each method call
 * to a "next handler" instance, with just the tail parameters.  We ignore the head and middle parameters.
 */
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

    /**
     * Wrap the class in a function, taking a base class and an invariants array for all instances.
     * @param classArguments - constructor argument types for the class.
     */
    public wrapClass(
      classArguments: string,
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

    /** The number of head parameters we have.  Also, the number of _tail_ parameters. */
    #headParameterCount = 0;

    protected methodDeclarationTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void {
      if (methodStructure) {
        this.#headParameterCount = methodStructure.parameters?.length ?? 0;
      }
      else if (isBefore) {
        this.#writeHandlerAndConstructor();
      }

      super.methodDeclarationTrap(methodStructure, isBefore);
    }

    /**
     * Build the `#nextHandler` field, and the constructor which populates it.
     */
    #writeHandlerAndConstructor() : void
    {
      this.classWriter.writeLine(`
  readonly #nextHandler: ${this.interfaceOrAliasName};
      `.trim());
      this.classWriter.newLine();

      this.addConstructorWriter({
        parameters: [],
        writer: (writer: CodeBlockWriter) => {
          writer.writeLine("this.#nextHandler = new BaseClass(...parameters);");
        }
      }, "BaseClass");
    }

    protected buildMethodBodyTrap(
      methodStructure: TS_Method,
      remainingArgs: Set<OptionalKind<ParameterDeclarationStructure>>,
    ): void
    {
      const tailParams = methodStructure.parameters?.slice(
        -this.#headParameterCount
      ) ?? [];

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
