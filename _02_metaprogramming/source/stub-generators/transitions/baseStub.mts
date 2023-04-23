import type {
  WriterFunction
} from "ts-morph";

import BaseStub, {
  type ExtendsAndImplements,
} from "../base/baseStub.mjs";

import addPublicTypeImport from "../base/utilities/addPublicTypeImport.mjs";

import {
  isNotDefined,
  markDefined,
  NOT_DEFINED,
  type MaybeDefined,
} from "../../../../_01_stage_utilities/source/maybeDefined.mjs";

import extractType from "../base/utilities/extractType.mjs";

import type {
  TS_Method,
  TS_Parameter,
} from "../base/types/private-types.mjs";

import type {
  ParamRenamer,
} from "./types/paramRenamer.mjs";

export default class TransitionsStub extends BaseStub
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

  #buildMethodBody: MaybeDefined<
    (methodStructure: TS_Method) => void
  > = NOT_DEFINED;

  defineBuildMethodBody(
    builder: (
      this: TransitionsStub,
      methodStructure: TS_Method,
    ) => void
  ) : void
  {
    this.#buildMethodBody = markDefined(builder);
  }

  buildClass() : void
  {
    if (isNotDefined(this.#extraParams))
      throw new Error("Call this.defineExtraParams()");
    if (isNotDefined(this.#buildMethodBody))
      throw new Error("Call this.defineBuildMethodBody()");
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

    if (methodStructure) {
      if (isNotDefined(this.#extraParams))
        throw new Error("assertion failure, no extra params yet");

      methodStructure.parameters ||= [];
      methodStructure.parameters.push(
        ...this.#extraParams.middleParameters,
        ...methodStructure.parameters.map(param => this.#mapParameter(param))
      );
    }
    else {
      addPublicTypeImport(
        this, "TransitionInterface.mjs", "TransitionInterface"
      );
    }
  }

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

  protected buildMethodBody(
    methodStructure: TS_Method,
  ): void
  {
    if (isNotDefined(this.#buildMethodBody))
      throw new Error("unreachable");
    return this.#buildMethodBody.apply(this, [methodStructure]);
  }
}
