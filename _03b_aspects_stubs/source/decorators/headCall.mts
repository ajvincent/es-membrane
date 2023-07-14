// #region preamble
import type {
  WriterFunction
} from "ts-morph";

import CodeBlockWriter from "code-block-writer";

import getRequiredInitializers from "#stage_utilities/source/RequiredInitializers.mjs";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import {
  markDefined,
  NOT_DEFINED,
  type MaybeDefined,
  assertDefined,
  assertNotDefined,
} from "#stage_utilities/source/maybeDefined.mjs";

import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import extractType, {
  writerOptions
} from "../utilities/extractType.mjs";

import type {
  AspectsStubDecorator
} from "../types/AspectsStubDecorator.mjs";

import type {
  TS_Method,
  TS_Parameter,
} from "../types/ts-morph-native.mjs";

import type {
  ParamRenamer
} from "../types/paramRenamer.mjs";

import type {
  MiddleParamBuilder,
  TailParamBuilder
} from "../types/paramBuilders.mjs";

import aspectTypeImport from "../utilities/aspectTypeImport.mjs";

// #endregion preamble

declare const HeadCallKey: unique symbol;

export type HeadCallFields = RightExtendsLeft<StaticAndInstance<typeof HeadCallKey>, {
  staticFields: object,
  instanceFields: {
    /**
     * Define extra parameters for each method of the stub class.
     *
     * @param includeHeadParameters - True to include original arguments before middle parameters.
     * @param middleParameters - parameter definitions which aren't necessarily based on the original arguments.
     * @param middleParamsTypeAliasName - A type alias name to use for the middle parameter types.
     * @param middleParamBuilder - A function to define middle parameters.
     * @param tailParamRenamer - A simple function to give us a new name for a wrapped original argument.
     * @param tailParamBuilder - A function to define tail parameters.
     */
    defineExtraParams(
      includeHeadParameters: boolean,
      middleParameters: ReadonlyArray<TS_Parameter>,
      middleParamsTypeAliasName: string,
      middleParamBuilder: MiddleParamBuilder,
      tailParamRenamer: ParamRenamer,
      tailParamBuilder: TailParamBuilder,
    ): void;

    /**
     * Wrap the class in a function, taking a base class and an invariants array for all instances.
     *
     * Call this.defineExtraParams() first.
     *
     * @param classArguments - constructor argument types for the class.
     */
    wrapClass(
      classArguments: string
    ): void;
  },
  symbolKey: typeof HeadCallKey,
}>;

/**
 * @remarks
 *
 * "Head" transition classes need to define middle and tail parameters, for passing to a "middle" transition class.
 * Because these parameters do not exist initially, this code must generate them, and requires more configuration
 * settings from the developer.
 *
 * Also, the stubs require a "next handler", a "middle" transition class with the additional parameters on each method,
 * to forward calls to.
 */
const TransitionsHeadCallDecorator: AspectsStubDecorator<HeadCallFields> = function(
  this: void,
  baseClass
)
{
  return class TransitionsHead extends baseClass {
    static readonly #INIT_EXTRA_PARAMS_KEY = "(extra parameters in head subclass)";
    static readonly #WRAP_CLASS_KEY = "(wrap class, head)";

    #extraParams: MaybeDefined<Readonly<{
      /**
       * True if the pattern is (original arguments, middle parameters, wrapped original arguments).
       * False for (middle parameters, original arguments.)
       */
      includeHeadParameters: boolean;

      /** parameter definitions which aren't necessarily based on the original arguments. */
      middleParameters: ReadonlyArray<TS_Parameter>;

      /** A type alias name to use for the middle parameter types. */
      middleParamsTypeAliasName: string;

      /** Extracted names from the array of parameters. */
      middleParameterNames: ReadonlyArray<string>;

      /** A function to define middle parameters. */
      middleParamBuilder: MiddleParamBuilder;

      /** A simple function to give us a new name for a wrapped original argument. */
      tailParamRenamer: ParamRenamer;

      /** A function to define tail parameters. */
      tailParamBuilder: TailParamBuilder;

      /** Extracted serialization of the middle parameter type definitions. */
      middleParamTypes: string;
    }>> = NOT_DEFINED;

    /** A writer for the transitions type alias. */
    readonly #beforeClassWriter = new CodeBlockWriter(writerOptions);

    constructor(...args: unknown[]) {
      super(...args);
      getRequiredInitializers(this).add(TransitionsHead.#INIT_EXTRA_PARAMS_KEY);
      getRequiredInitializers(this).add(TransitionsHead.#WRAP_CLASS_KEY);
    }

    /**
     * Define extra parameters for each method of the stub class.
     *
     * @param includeHeadParameters - True to include original arguments before middle parameters.
     * @param middleParameters - parameter definitions which aren't necessarily based on the original arguments.
     * @param middleParamsTypeAliasName - A type alias name to use for the middle parameter types.
     * @param middleParamBuilder - A function to define middle parameters.
     * @param tailParamRenamer - A simple function to give us a new name for a wrapped original argument.
     * @param tailParamBuilder - A function to define tail parameters.
     */
    public defineExtraParams(
      includeHeadParameters: boolean,
      middleParameters: ReadonlyArray<TS_Parameter>,
      middleParamsTypeAliasName: string,
      middleParamBuilder: MiddleParamBuilder,
      tailParamRenamer: ParamRenamer,
      tailParamBuilder: TailParamBuilder,
    ) : void
    {
      getRequiredInitializers(this).mayResolve(TransitionsHead.#INIT_EXTRA_PARAMS_KEY);
      assertNotDefined(this.#extraParams);
  
      middleParameters.forEach((param, index) => {
        if (!param.type)
          throw new Error("Missing parameter type at index " + String(index));
      });
  
      this.#extraParams = markDefined({
        includeHeadParameters,
        middleParameters,
        middleParamsTypeAliasName,
        middleParameterNames: middleParameters.map(param => param.name),
        middleParamBuilder,
        tailParamRenamer,
        tailParamBuilder,
        middleParamTypes: middleParameters.map(
          param => extractType(param.type as string | WriterFunction, true)
        ).join(", "),
      });

      getRequiredInitializers(this).resolve(TransitionsHead.#INIT_EXTRA_PARAMS_KEY);
    }

    /**
     * Wrap the class in a function, taking a base class and an invariants array for all instances.
     *
     * Call this.defineExtraParams() first.
     *
     * @param classArguments - constructor argument types for the class.
     */
    public wrapClass(
      classArguments: string
    ): void
    {
      getRequiredInitializers(this).mayResolve(TransitionsHead.#WRAP_CLASS_KEY);

      const extraParams = assertDefined(this.#extraParams);

      const baseInstanceType = `TransitionInterface<${
        extraParams.includeHeadParameters.toString()
      }, ${
        this.interfaceOrAliasName
      }, ${extraParams.middleParamsTypeAliasName}>`;

      this.wrapInFunction(
        [],
        [{
          name: "BaseClass",
          type: `Class<${baseInstanceType}${
            classArguments ? ", " + classArguments : ""
          }>`,
        }],
        "TransitionsHeadClass",
        (classWriter: CodeBlockWriter) => { void(classWriter) },
      );

      getRequiredInitializers(this).resolve(TransitionsHead.#WRAP_CLASS_KEY);
    }

    protected methodDeclarationTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void
    {
      super.methodDeclarationTrap(methodStructure, isBefore);
      if (!isBefore || methodStructure)
        return;

      const extraParams = assertDefined(this.#extraParams);

      aspectTypeImport(
        this, "TransitionInterface.mjs", "TransitionInterface"
      );

      this.#beforeClassWriter.writeLine(
        `type ${
          extraParams.middleParamsTypeAliasName
        } = [${
          extraParams.middleParamTypes
        }];`
      );

      this.#writeHandlerAndConstructor();
    }

    /**
     * Build the `#nextHandler` field, and the constructor which populates it.
     */
    #writeHandlerAndConstructor() : void
    {
      const context = new Map<symbol, unknown>;
      const { implements: _implements } = this.getExtendsAndImplementsTrap(context);
      if (_implements.length !== 1) {
        throw new Error("No support yet for multiple-implements, fix me!!");
      }

      const extraParams = assertDefined(this.#extraParams);
      const transitionType = `TransitionInterface<${
        extraParams.includeHeadParameters.toString()
      }, ${
        _implements[0]
      }, ${
        extraParams.middleParamsTypeAliasName
      }>`;

      this.classWriter.writeLine(`
  readonly #nextHandler: ${transitionType};
      `.trim());
      this.classWriter.newLine();

      this.addConstructorWriter({
        parameters: [],
        writer: (writer: CodeBlockWriter) => {
          writer.writeLine("this.#nextHandler = new BaseClass(...parameters);");
        }
      }, "BaseClass");
    }


    protected writeBeforeExportTrap(): string {
      return this.#beforeClassWriter.toString();
    }

    protected buildMethodBodyTrap(
      methodStructure: TS_Method,
      remainingArgs: Set<TS_Parameter>,
    ) : void
    {
      const {
        includeHeadParameters,
        middleParamBuilder,
        middleParameters,
        middleParameterNames,
        tailParamRenamer,
        tailParamBuilder
      } = assertDefined(this.#extraParams);

      // We need to delegate creating the middle parameters.
      middleParameters.forEach(
        param => middleParamBuilder.apply(this, [methodStructure, param])
      );

      const headParameterNames = methodStructure.parameters?.map(param => param.name) ?? []

      let tailParameterNames: string[] = [];
      if (includeHeadParameters && methodStructure.parameters) {
        // Ask the tail parameter builder to write new variables.
        tailParameterNames = methodStructure.parameters.map(param => {
          const newName = tailParamRenamer(param.name);
          tailParamBuilder.apply(this, [
            methodStructure, param, newName
          ]);
          return newName;
        });
      }

      TransitionsHead.pairedWrite(
        this.classWriter,
        `return this.#nextHandler.${methodStructure.name}(`,
        ");",
        true,
        true,
        () => {
          if (includeHeadParameters) {
            this.classWriter.write([
              ...headParameterNames,
              ...middleParameterNames,
              ...tailParameterNames,
            ].join(", "));
          }
          else {
            this.classWriter.write([
              ...middleParameterNames,
              ...headParameterNames
            ].join(", "));
          }
        }
      );

      remainingArgs.clear();
    }
  }
}

export default TransitionsHeadCallDecorator;
