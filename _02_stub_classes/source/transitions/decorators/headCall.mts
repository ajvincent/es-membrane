// #region preamble

import type {
  WriterFunction
} from "ts-morph";

import CodeBlockWriter from "code-block-writer";

import type {
  ReadonlyDeep
} from "type-fest";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#stage_utilities/source/types/StaticAndInstance.mjs";

import extractType, {
  writerOptions
} from "../../base/utilities/extractType.mjs";

import {
  markDefined,
  NOT_DEFINED,
  type MaybeDefined,
  assertDefined,
  assertNotDefined,
} from "#stage_utilities/source/maybeDefined.mjs";

import type {
  ConfigureStubDecorator
} from "../../base/types/ConfigureStubDecorator.mjs"

import type {
  TS_Method,
  TS_Parameter,
} from "../../base/types/private-types.mjs";

import addTransitionTypeImport from "../utilities/addTransitionTypeImport.mjs";

import type {
  ParamRenamer
} from "../types/paramRenamer.mjs";
import ConfigureStub from "../../base/ConfigureStub.mjs";

// #endregion preamble

export type MiddleParamBuilder = (
  this: ConfigureStub,
  methodStructure: ReadonlyDeep<TS_Method>,
  structure: ReadonlyDeep<TS_Parameter>,
) => void;

export type TailParamBuilder = (
  this: ConfigureStub,
  methodStructure: ReadonlyDeep<TS_Method>,
  structure: ReadonlyDeep<TS_Parameter>,
  newParameterName: string,
) => void;

export type HeadCallFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: {
    defineExtraParams(
      middleParameters: ReadonlyArray<TS_Parameter>,
      middleParamsTypeAliasName: string,
      middleParamBuilder: MiddleParamBuilder,
      tailParamRenamer: ParamRenamer,
      tailParamBuilder: TailParamBuilder,
    ) : void;
  }
}>;

const TransitionsHeadCallDecorator: ConfigureStubDecorator<HeadCallFields, false> = function(
  this: void,
  baseClass
)
{
  return class TransitionsHead extends baseClass {
    static readonly #INIT_EXTRA_PARAMS_KEY = "(extra parameters in head subclass)";

    #extraParams: MaybeDefined<Readonly<{
      middleParameters: ReadonlyArray<TS_Parameter>;
      middleParamsTypeAliasName: string;
      middleParameterNames: ReadonlyArray<string>;
      middleParamBuilder: MiddleParamBuilder;
      tailParamRenamer: ParamRenamer;
      tailParamBuilder: TailParamBuilder;
      middleParamTypes: string;
    }>> = NOT_DEFINED;

    readonly #beforeClassWriter = new CodeBlockWriter(writerOptions);

    constructor(...args: unknown[]) {
      super(...args);
      this.requiredInitializers.add(TransitionsHead.#INIT_EXTRA_PARAMS_KEY);
    }

    defineExtraParams(
      middleParameters: ReadonlyArray<TS_Parameter>,
      middleParamsTypeAliasName: string,
      middleParamBuilder: MiddleParamBuilder,
      tailParamRenamer: ParamRenamer,
      tailParamBuilder: TailParamBuilder,
    ) : void
    {
      this.requiredInitializers.mayResolve(TransitionsHead.#INIT_EXTRA_PARAMS_KEY);
      assertNotDefined(this.#extraParams);
  
      middleParameters.forEach((param, index) => {
        if (!param.type)
          throw new Error("Missing parameter type at index " + String(index));
      });
  
      this.#extraParams = markDefined({
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

      this.requiredInitializers.resolve(TransitionsHead.#INIT_EXTRA_PARAMS_KEY);
    }

    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void
    {
      super.methodTrap(methodStructure, isBefore);
      if (!isBefore || methodStructure)
        return;

      const extraParams = assertDefined(this.#extraParams);

      addTransitionTypeImport(
        this, "TransitionInterface.mjs", "TransitionInterface"
      );
  
      this.#beforeClassWriter.writeLine(
        `type ${
          extraParams.middleParamsTypeAliasName
        } = [${
          extraParams.middleParamTypes
        }];`
      );
  
      this.#writeHandlerAndConstructor(
        extraParams.middleParamsTypeAliasName
      );
    }

    #writeHandlerAndConstructor(
      middleParamsTypeAliasName: string
    ) : void
    {
      const { implements: _implements } = this.getExtendsAndImplements();
      if (_implements.length !== 1) {
        throw new Error("No support yet for multiple-implements, fix me!!");
      }

      const transitionType = `TransitionInterface<${
        _implements[0]
      }, ${
        middleParamsTypeAliasName
      }>`;

      this.classWriter.writeLine(`
  readonly #nextHandler: ${transitionType};
      `.trim());
      this.classWriter.newLine();
  
      TransitionsHead.pairedWrite(
        this.classWriter,
        "constructor(",
        ")",
        false,
        true,
        () => {
          this.classWriter.writeLine(`
  nextHandler: ${transitionType},
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

    protected writeBeforeClass(): string {
      return this.#beforeClassWriter.toString();
    }

    protected buildMethodBody(
      methodStructure: TS_Method,
      remainingArgs: Set<TS_Parameter>,
    ) : void
    {
      const {
        middleParamBuilder,
        middleParameters,
        middleParameterNames,
        tailParamRenamer,
        tailParamBuilder
      } = assertDefined(this.#extraParams);

      middleParameters.forEach(
        param => middleParamBuilder.apply(this, [methodStructure, param])
      );
  
      const headParameterNames = methodStructure.parameters?.map(param => param.name) ?? []
  
      const tailParameterNames = methodStructure.parameters?.map(param => {
        const newName = tailParamRenamer(param.name);
        tailParamBuilder.apply(this, [
          methodStructure, param, newName
        ]);
        return newName;
      }) ?? [];
  
      TransitionsHead.pairedWrite(
        this.classWriter,
        `return this.#nextHandler.${methodStructure.name}(`,
        ");",
        true,
        true,
        () => {
          this.classWriter.write([
            ...headParameterNames,
            ...middleParameterNames,
            ...tailParameterNames,
          ].join(", "))
        }
      );

      remainingArgs.clear();
    }
  }
}

export default TransitionsHeadCallDecorator;
