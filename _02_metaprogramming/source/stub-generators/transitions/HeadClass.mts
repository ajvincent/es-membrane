// #region preamble

import type {
  WriterFunction
} from "ts-morph";

import CodeBlockWriter from "code-block-writer";

import type {
  ReadonlyDeep
} from "type-fest";

import {
  isNotDefined,
  markDefined,
  NOT_DEFINED,
  type MaybeDefined,
} from "../../../../_01_stage_utilities/source/maybeDefined.mjs";

import addPublicTypeImport from "../base/utilities/addPublicTypeImport.mjs";

import BaseStub, {
  type ExtendsAndImplements,
} from "../base/baseStub.mjs";


import extractType, {
  writerOptions
} from "../base/utilities/extractType.mjs";

import type {
  TS_Method,
  TS_Parameter,
} from "../base/types/private-types.mjs";

import type {
  ParamRenamer,
} from "./types/paramRenamer.mjs";

// #endregion preamble

export type MiddleParamBuilder = (
  this: TransitionsEntryStub,
  methodStructure: ReadonlyDeep<TS_Method>,
  structure: ReadonlyDeep<TS_Parameter>,
) => void;

export type TailParamBuilder =(
  this: TransitionsEntryStub,
  methodStructure: ReadonlyDeep<TS_Method>,
  structure: ReadonlyDeep<TS_Parameter>,
  newParameterName: string,
) => void;

export default class TransitionsEntryStub extends BaseStub
{
  #extraParams: MaybeDefined<Readonly<{
    middleParameters: ReadonlyArray<TS_Parameter>;
    middleParamsTypeAliasName: string;
    middleParameterNames: ReadonlyArray<string>;
    middleParamBuilder: MiddleParamBuilder;
    tailParamRenamer: ParamRenamer;
    tailParamBuilder: TailParamBuilder;
    middleParamTypes: string;
  }>> = NOT_DEFINED;

  defineExtraParams(
    middleParameters: ReadonlyArray<TS_Parameter>,
    middleParamsTypeAliasName: string,
    middleParamBuilder: MiddleParamBuilder,
    tailParamRenamer: ParamRenamer,
    tailParamBuilder: TailParamBuilder,
  ) : void
  {
    if (!isNotDefined(this.#extraParams))
      throw new Error("Extra parameters already defined");

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
  }

  buildClass(): void {
    if (isNotDefined(this.#extraParams))
      throw new Error("Call this.defineExtraParams()");
    super.buildClass();
  }

  protected getExtendsAndImplements(): ExtendsAndImplements
  {
    return {
      extends: [],
      implements: [this.interfaceOrAliasName],
    };
  }

  readonly #beforeClassWriter = new CodeBlockWriter(writerOptions);

  protected methodTrap(
    methodStructure: TS_Method | null,
    isBefore: boolean
  ) : void
  {
    if (!isBefore || methodStructure)
      return;

    if (isNotDefined(this.#extraParams)) {
      throw new Error("assertion failure, no extra params yet");
    }

    addPublicTypeImport(
      this, "TransitionInterface.mjs", "TransitionInterface"
    );

    this.#beforeClassWriter.writeLine(
      `type ${
        this.#extraParams.middleParamsTypeAliasName
      } = [${
        this.#extraParams.middleParamTypes
      }];`
    );

    this.#writeHandlerAndConstructor(
      this.#extraParams.middleParamsTypeAliasName
    );
  }

  #writeHandlerAndConstructor(
    middleParamsTypeAliasName: string
  ) : void
  {
    const transitionType = `TransitionInterface<${
      this.interfaceOrAliasName
    }, ${
      middleParamsTypeAliasName
    }>`;

    this.classWriter.writeLine(`
readonly #nextHandler: ${transitionType};
    `.trim());
    this.classWriter.newLine();

    BaseStub.pairedWrite(
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

  protected buildMethodBody(
    methodStructure: TS_Method
  ) : void
  {
    if (isNotDefined(this.#extraParams))
      throw new Error("assertion failure, no extra params yet");

    const {
      middleParamBuilder,
      middleParameters,
      middleParameterNames,
      tailParamRenamer,
      tailParamBuilder
    } = this.#extraParams;

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

    BaseStub.pairedWrite(
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
  }

  protected writeBeforeClass(): string {
    return this.#beforeClassWriter.toString();
  }
}
