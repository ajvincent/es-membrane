// #region preamble
import getRequiredInitializers from "#stage_utilities/source/RequiredInitializers.mjs";

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
    /**
     * Define extra parameters for each method of the stub class.
     *
     * @param includeHeadParameters - True to include original arguments before middle parameters.
     * @param middleParameters - parameter definitions which aren't necessarily based on the original arguments.
     * @param tailParamRenamer - A simple function to give us a new name for a wrapped original argument.
     */
    defineExtraParams(
      includeHeadParameters: boolean,
      middleParameters: readonly TS_Parameter[],
      tailParamRenamer: ParamRenamer,
    ) : void;
  },
  symbolKey: typeof DefineParamsKey,
}>;

/**
 * @remarks
 *
 * "Middle" and "tail" classes need definitions for extra parameters.  This class takes care of that,
 * defining them for the method signatures.  The additional arguments, therefore, we assume exist.
 */
const DefineExtraParamsShortDecorator: AspectsStubDecorator<DefineExtraParamsShortFields> = function(
  this: void,
  baseClass
) {
  return class TransitionsBase extends baseClass {
    static readonly #INIT_EXTRA_PARAMS_KEY = "(extra parameters in subclass)";

    #extraParams: MaybeDefined<{
      /**
       * True if the pattern is (original arguments, middle parameters, wrapped original arguments).
       * False for (middle parameters, original arguments.)
       */
      includeHeadParameters: boolean;

      /** parameter definitions which aren't necessarily based on the original arguments. */
      middleParameters: readonly TS_Parameter[];

      /** A simple function to give us a new name for a wrapped original argument. */
      tailParamRenamer: ParamRenamer;

      /** Extracted serialization of the middle parameter type definitions. */
      middleParamTypes: string;
    }> = NOT_DEFINED;

    constructor(...args: unknown[]) {
      super(...args);
      getRequiredInitializers(this).add(TransitionsBase.#INIT_EXTRA_PARAMS_KEY);
    }

    /**
     * Define extra parameters for each method of the stub class.
     *
     * @param includeHeadParameters - True to include original arguments before middle parameters.
     * @param middleParameters - parameter definitions which aren't necessarily based on the original arguments.
     * @param tailParamRenamer - A simple function to give us a new name for a wrapped original argument.
     */
    public defineExtraParams(
      includeHeadParameters: boolean,
      middleParameters: readonly TS_Parameter[],
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
        includeHeadParameters,
        middleParameters,
        tailParamRenamer,
        middleParamTypes: middleParameters.map(
          param => extractType(param.type!, true)
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
          typeName => `TransitionInterface<${
            extraParams.includeHeadParameters.toString()
          }, ${typeName}, [${extraParams.middleParamTypes}]>`
        ),
      };
    }

    protected methodDeclarationTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void {
      super.methodDeclarationTrap(methodStructure, isBefore);

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

        if (extraParams.includeHeadParameters) {
          if (methodStructure.parameters.length) {
            const lastHeadParameter = methodStructure.parameters.at(-1);
            if (lastHeadParameter?.isRestParameter)
              throw new Error("includeHeadParameters does not work with rest parameters, method: " + methodStructure.name);
          }

          methodStructure.parameters.push(
            ...extraParams.middleParameters,
            ...methodStructure.parameters.map(param => this.#mapParameter(param))
          );
        }
        else {
          methodStructure.parameters.unshift(
            ...extraParams.middleParameters
          );
        }
      }
    }

    /**
     * Create a copy of an existing parameter.
     * @param param - the original parameter.
     * @returns the newly named parameter.
     */
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
