import type {
  WriterFunction
} from "ts-morph";

import BaseStub, {
  type ExtendsAndImplements,
} from "../base/baseStub.mjs";

import addPublicTypeImport from "../base/addPublicTypeImport.mjs";

import {
  isNotDefined,
  markDefined,
  NOT_DEFINED,
  type MaybeDefined,
} from "../../../../_01_stage_utilities/source/maybeDefined.mjs";

import extractType from "../base/extractType.mjs";

import type {
  TS_Method,
  TS_Parameter,
} from "../base/private-types.mjs";

import type {
  ParamRenamer,
} from "./paramRenamer.mjs";

export default class TransitionsTailStub extends BaseStub
{
  #extraParams: MaybeDefined<{
    middleParameters: ReadonlyArray<TS_Parameter>;
    tailParamRenamer: ParamRenamer;
    middleParamTypes: string;
  }> = NOT_DEFINED;

  defineExtraParams(
    middleParameters: ReadonlyArray<TS_Parameter>,
    tailParamRenamer: ParamRenamer,
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
      tailParamRenamer,
      middleParamTypes: middleParameters.map(
        param => extractType(param.type as string | WriterFunction, true)
      ).join(", "),
    });
  }

  buildClass() : void
  {
    if (isNotDefined(this.#extraParams))
      throw new Error("Call this.defineExtraParams()");
    super.buildClass();
  }

  protected getExtendsAndImplements(): ExtendsAndImplements
  {
    if (isNotDefined(this.#extraParams))
      throw new Error("assertion failure, no extra params yet");

    return {
      extends: [],
      implements: [
        `TransitionInterface<${
          this.interfaceOrAliasName
        }, [${
          this.#extraParams.middleParamTypes
        }]>`,
      ],
    };
  }

  protected methodTrap(
    methodStructure: TS_Method | null,
    isBefore: boolean
  ) : void
  {
    if (!isBefore)
      return super.methodTrap(methodStructure, isBefore);

    this.#headParameterCount = 0;
    if (methodStructure) {
      if (isNotDefined(this.#extraParams))
        throw new Error("assertion failure, no extra params yet");

      methodStructure.parameters ||= [];
      this.#headParameterCount = methodStructure.parameters.length;
      methodStructure.parameters.push(
        ...this.#extraParams.middleParameters,
        ...methodStructure.parameters.map(param => this.#mapParameter(param))
      );
    }
    else {
      addPublicTypeImport(
        this, "TransitionInterface.mjs", "TransitionInterface"
      );

      this.#writeHandlerAndConstructor()
    }
  }

  #headParameterCount = 0;

  #mapParameter(
    param: TS_Parameter
  ) : TS_Parameter
  {
    if (isNotDefined(this.#extraParams))
      throw new Error("unreachable");

    const name = this.#extraParams.tailParamRenamer(param.name);
    return {
      ...param,
      name
    };
  }

  #writeHandlerAndConstructor() : void
  {
    this.classWriter.writeLine(`
readonly #nextHandler: ${this.interfaceOrAliasName};
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
  ): void
  {
    if (isNotDefined(this.#extraParams))
      throw new Error("unreachable");

    methodStructure.parameters?.slice(
      0, methodStructure.parameters.length - this.#headParameterCount
    ).forEach(
      param => this.classWriter.writeLine(`void(${param.name});`)
    );

    const tailParams = methodStructure.parameters?.slice(
      -this.#headParameterCount
    ).map(param => param.name) || []

    this.classWriter.writeLine(
      `return this.#nextHandler.${methodStructure.name}(${
        tailParams.join(", ")
      });`
    );
  }
}
