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

import aspectTypeImport from "../utilities/aspectTypeImport.mjs";

// #endregion preamble

import type {
  MiddleParamBuilder,
  TailParamBuilder
} from "../types/paramBuilders.mjs";

declare const HeadCallKey: unique symbol;

export type HeadCallFields = RightExtendsLeft<StaticAndInstance<typeof HeadCallKey>, {
  staticFields: object,
  instanceFields: {
    wrapInClass(
      classArguments: string
    ): void;

    defineExtraParams(
      includeHeadParameters: boolean,
      middleParameters: ReadonlyArray<TS_Parameter>,
      middleParamsTypeAliasName: string,
      middleParamBuilder: MiddleParamBuilder,
      tailParamRenamer: ParamRenamer,
      tailParamBuilder: TailParamBuilder,
    ) : void;
  },
  symbolKey: typeof HeadCallKey,
}>;

const TransitionsHeadCallDecorator: AspectsStubDecorator<HeadCallFields> = function(
  this: void,
  baseClass
)
{
  return class TransitionsHead extends baseClass {
    static readonly #INIT_EXTRA_PARAMS_KEY = "(extra parameters in head subclass)";
    static readonly #WRAP_CLASS_KEY = "(wrap class, head)";

    #extraParams: MaybeDefined<Readonly<{
      includeHeadParameters: boolean;
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
      getRequiredInitializers(this).add(TransitionsHead.#INIT_EXTRA_PARAMS_KEY);
      getRequiredInitializers(this).add(TransitionsHead.#WRAP_CLASS_KEY);
    }

    wrapInClass(
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
        (classWriter: CodeBlockWriter, originalWriter: WriterFunction) => {
          originalWriter(classWriter);
        },
      );

      getRequiredInitializers(this).resolve(TransitionsHead.#WRAP_CLASS_KEY);
    }

    defineExtraParams(
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

    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void
    {
      super.methodTrap(methodStructure, isBefore);
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
  
      this.#writeHandlerAndConstructor(
        extraParams.middleParamsTypeAliasName
      );
    }

    #writeHandlerAndConstructor(
      middleParamsTypeAliasName: string
    ) : void
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

      middleParameters.forEach(
        param => middleParamBuilder.apply(this, [methodStructure, param])
      );
  
      const headParameterNames = methodStructure.parameters?.map(param => param.name) ?? []

      let tailParameterNames: string[] = [];
      if (includeHeadParameters) {
        tailParameterNames = methodStructure.parameters?.map(param => {
          const newName = tailParamRenamer(param.name);
          tailParamBuilder.apply(this, [
            methodStructure, param, newName
          ]);
          return newName;
        }) ?? [];
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
            ].join(", "))
          }
          else {
            this.classWriter.write([
              ...middleParameterNames,
              ...headParameterNames
            ].join(", "))
          }
        }
      );

      remainingArgs.clear();
    }
  }
}

export default TransitionsHeadCallDecorator;
