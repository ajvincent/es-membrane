// #region preamble

import type {
  RightExtendsLeft
} from "../../../../../_01_stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "../../../../../_01_stage_utilities/source/types/StaticAndInstance.mjs";

import {
  markDefined,
  NOT_DEFINED,
  type MaybeDefined,
  assertDefined,
  assertNotDefined,
} from "../../../../../_01_stage_utilities/source/maybeDefined.mjs";

import type {
  ConfigureStubDecorator
} from "../../base/types/ConfigureStubDecorator.mjs"

import type {
  TS_Method,
} from "../../base/types/private-types.mjs";

// #endregion preamble

export type BuildMethodBodyFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: {
    defineBuildMethodBody(
      builder: (
        methodStructure: TS_Method,
      ) => void
    ) : void;
  }
}>;

const BuildMethodBodyDecorator: ConfigureStubDecorator<BuildMethodBodyFields> = function(
  this: void,
  baseClass
)
{
  return class TransitionsBase extends baseClass {
    static readonly #INIT_BUILD_METHOD_KEY = "(build method in subclass key)";

    constructor(...args: unknown[]) {
      super(...args);
      this.requiredInitializers.add(TransitionsBase.#INIT_BUILD_METHOD_KEY);
    }

    #buildMethodBody: MaybeDefined<
      (methodStructure: TS_Method) => void
    > = NOT_DEFINED;

    defineBuildMethodBody(
      builder: (
        methodStructure: TS_Method,
      ) => void
    ) : void {
      this.requiredInitializers.mayResolve(TransitionsBase.#INIT_BUILD_METHOD_KEY);

      assertNotDefined(this.#buildMethodBody);
      this.#buildMethodBody = markDefined(builder);

      this.requiredInitializers.resolve(TransitionsBase.#INIT_BUILD_METHOD_KEY);
    }

    protected buildMethodBody(
      methodStructure: TS_Method,
    ): void
    {
      const builder = assertDefined(this.#buildMethodBody);
      return builder.apply(this, [methodStructure]);
    }
  }
}

export default BuildMethodBodyDecorator;
