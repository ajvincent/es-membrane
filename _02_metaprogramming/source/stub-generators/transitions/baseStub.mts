import type {
  MethodSignatureStructure,
  OptionalKind,
  ParameterDeclarationStructure,
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

type MiddleParameters = OptionalKind<ParameterDeclarationStructure>[];
type ParamRenamer = (this: void, name: string) => string;

export default class TransitionsStub extends BaseStub
{
  #extraParams: MaybeDefined<{
    middleParameters: MiddleParameters,
    tailParamRenamer: ParamRenamer,
    middleParamTypes: string;
  }> = NOT_DEFINED;

  defineExtraParams(
    middleParameters: MiddleParameters,
    tailParamRenamer: ParamRenamer
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
    (structure: OptionalKind<MethodSignatureStructure>) => void
  > = NOT_DEFINED;

  defineBuildMethodBody(
    builder: (
      this: TransitionsStub,
      structure: OptionalKind<MethodSignatureStructure>
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
    methodStructure: OptionalKind<MethodSignatureStructure> | null,
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

    return super.methodTrap(methodStructure, isBefore);
  }

  #mapParameter(
    param: OptionalKind<ParameterDeclarationStructure>
  ) : OptionalKind<ParameterDeclarationStructure>
  {
    if (isNotDefined(this.#extraParams))
      throw new Error("unreachable");
    return {
      ...param,
      name: this.#extraParams.tailParamRenamer(param.name),
    };
  }

  protected buildMethodBody(
    structure: OptionalKind<MethodSignatureStructure>
  ): void
  {
    if (isNotDefined(this.#buildMethodBody))
      throw new Error("unreachable");
    return this.#buildMethodBody.apply(this, [structure]);
  }
}
