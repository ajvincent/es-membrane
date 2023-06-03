// #region preamble

import type {
  WriterFunction
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#stage_utilities/source/types/StaticAndInstance.mjs";

import extractType from "../../base/utilities/extractType.mjs";

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
  ExtendsAndImplements
} from "../../base/ConfigureStub.mjs";

import type {
  TS_Method,
  TS_Parameter,
} from "../../base/types/private-types.mjs";

import addTransitionTypeImport from "../utilities/addTransitionTypeImport.mjs";

import type {
  ParamRenamer
} from "../types/paramRenamer.mjs";

// #endregion preamble

export type DefineExtraParamsShortFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: {
    defineExtraParams(
      middleParameters: ReadonlyArray<TS_Parameter>,
      tailParamRenamer: ParamRenamer,
    ) : void;
  }
}>;

const DefineExtraParamsShortDecorator: ConfigureStubDecorator<DefineExtraParamsShortFields> = function(
  this: void,
  baseClass
) {
  return class TransitionsBase extends baseClass {
    static readonly #INIT_EXTRA_PARAMS_KEY = "(extra parameters in subclass)";

    #extraParams: MaybeDefined<{
      middleParameters: ReadonlyArray<TS_Parameter>;
      tailParamRenamer: ParamRenamer;
      middleParamTypes: string;
    }> = NOT_DEFINED;

    constructor(...args: unknown[]) {
      super(...args);
      this.requiredInitializers.add(TransitionsBase.#INIT_EXTRA_PARAMS_KEY);
    }

    defineExtraParams(
      middleParameters: ReadonlyArray<TS_Parameter>,
      tailParamRenamer: ParamRenamer,
    ) : void
    {
      this.requiredInitializers.mayResolve(TransitionsBase.#INIT_EXTRA_PARAMS_KEY);
      assertNotDefined(this.#extraParams);

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

      this.requiredInitializers.resolve(TransitionsBase.#INIT_EXTRA_PARAMS_KEY);
    }

    protected getExtendsAndImplements(): ExtendsAndImplements {
      const extraParams = assertDefined(this.#extraParams);
      const inner = super.getExtendsAndImplements();
  
      return {
        extends: inner.extends,
        implements: inner.implements.map(
          typeName => `TransitionInterface<${typeName}, [${extraParams.middleParamTypes}]>`
        )
      };
    }

    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void {
      super.methodTrap(methodStructure, isBefore);

      if (!isBefore)
        return;

      if (!methodStructure) {
        addTransitionTypeImport(
          this, "TransitionInterface.mjs", "TransitionInterface"
        );
      }
      else {
        const extraParams = assertDefined(this.#extraParams);
        methodStructure.parameters ||= [];
        methodStructure.parameters.push(
          ...extraParams.middleParameters,
          ...methodStructure.parameters.map(param => this.#mapParameter(param))
        );
      }
    }

    #mapParameter(
      param: TS_Parameter
    ) : TS_Parameter
    {
      const extraParams = assertDefined(this.#extraParams);

      const name = extraParams.tailParamRenamer(param.name);
      return {
        ...param,
        name
      };
    }
  }
}

export default DefineExtraParamsShortDecorator;
