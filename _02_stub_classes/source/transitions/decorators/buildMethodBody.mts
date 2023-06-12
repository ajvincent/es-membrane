// #region preamble
import getRequiredInitializers from "#stage_utilities/source/RequiredInitializers.mjs";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#stage_utilities/source/types/StaticAndInstance.mjs";

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
  TS_Method, TS_Parameter,
} from "../../base/types/export-types.mjs";

// #endregion preamble

export type BuildMethodBodyFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: {
    defineBuildMethodBody(
      builder: (
        methodStructure: TS_Method,
        remainingArgs: Set<TS_Parameter>,
      ) => void
    ) : void;
  }
}>;

const BuildMethodBodyDecorator: ConfigureStubDecorator<BuildMethodBodyFields, false> = function(
  this: void,
  baseClass
)
{
  return class TransitionsBase extends baseClass {
    static readonly #INIT_BUILD_METHOD_KEY = "(build method in subclass key)";

    constructor(...args: unknown[]) {
      super(...args);
      getRequiredInitializers(this).add(TransitionsBase.#INIT_BUILD_METHOD_KEY);
    }

    #buildMethodBody: MaybeDefined<
      (methodStructure: TS_Method, remainingArgs: Set<TS_Parameter>) => void
    > = NOT_DEFINED;

    defineBuildMethodBody(
      builder: (
        methodStructure: TS_Method,
        remainingArgs: Set<TS_Parameter>,
      ) => void
    ) : void {
      getRequiredInitializers(this).mayResolve(TransitionsBase.#INIT_BUILD_METHOD_KEY);

      assertNotDefined(this.#buildMethodBody);
      this.#buildMethodBody = markDefined(builder);

      getRequiredInitializers(this).resolve(TransitionsBase.#INIT_BUILD_METHOD_KEY);
    }

    protected buildMethodBodyTrap(
      methodStructure: TS_Method,
      remainingArgs: Set<TS_Parameter>,
    ): void
    {
      const builder = assertDefined(this.#buildMethodBody);
      return builder.apply(this, [methodStructure, remainingArgs]);
    }
  }
}

export default BuildMethodBodyDecorator;
