// #region preamble
import getRequiredInitializers from "#stage_utilities/source/RequiredInitializers.mjs";

import type {
  WriterFunction
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import {
  markDefined,
  NOT_DEFINED,
  type MaybeDefined,
  assertDefined,
  assertNotDefined,
} from "#stage_utilities/source/maybeDefined.mjs";

import extractType from "../utilities/extractType.mjs";

import type {
  AspectsStubDecorator
} from "../types/AspectsStubDecorator.mjs";

import type {
  ExtendsAndImplements
} from "../AspectsStubBase.mjs";

import type {
  TS_Method,
  TS_Parameter,
} from "../types/ts-morph-native.mjs";

import type {
  ParamRenamer
} from "../types/paramRenamer.mjs";

import aspectTypeImport from "../utilities/aspectTypeImport.mjs";

// #endregion preamble

declare const DefineParamsKey: unique symbol;

export type DefineExtraParamsShortFields = RightExtendsLeft<StaticAndInstance<typeof DefineParamsKey>, {
  staticFields: object,
  instanceFields: {
    defineExtraParams(
      middleParameters: ReadonlyArray<TS_Parameter>,
      tailParamRenamer: ParamRenamer,
    ) : void;
  },
  symbolKey: typeof DefineParamsKey,
}>;

const DefineExtraParamsShortDecorator: AspectsStubDecorator<DefineExtraParamsShortFields, false> = function(
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
      getRequiredInitializers(this).add(TransitionsBase.#INIT_EXTRA_PARAMS_KEY);
    }

    defineExtraParams(
      middleParameters: ReadonlyArray<TS_Parameter>,
      tailParamRenamer: ParamRenamer,
    ) : void
    {
      getRequiredInitializers(this).mayResolve(TransitionsBase.#INIT_EXTRA_PARAMS_KEY);
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

      getRequiredInitializers(this).resolve(TransitionsBase.#INIT_EXTRA_PARAMS_KEY);
    }

    protected getExtendsAndImplementsTrap(context: Map<symbol, unknown>): ExtendsAndImplements {
      const extraParams = assertDefined(this.#extraParams);
      const inner = super.getExtendsAndImplementsTrap(context);
  
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
        aspectTypeImport(
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
