// #region preamble

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#stage_utilities/source/types/StaticAndInstance.mjs";

import type {
  ConfigureStubDecorator
} from "../types/ConfigureStubDecorator.mjs";

import type {
  ExtendsAndImplements
} from "../ConfigureStub.mjs";

import extractType from "../utilities/extractType.mjs"

import type {
  TS_Method,
  TS_Parameter
} from "../types/private-types.mjs";

import addBaseTypeImport from "../utilities/addBaseTypeImport.mjs";

// #endregion preamble

export type WrapThisInnerFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object
  instanceFields: object;
}>;

const WrapThisInnerDecorator: ConfigureStubDecorator<WrapThisInnerFields> = function(
  this: void,
  baseClass
)
{
  return class WrapThisAndParameters extends baseClass {
    protected getExtendsAndImplements(): ExtendsAndImplements
    {
      const inner = super.getExtendsAndImplements();
      return {
        extends: inner.extends,
        implements: inner.implements.map(value => `WrapThisAndParameters<${value}>`),
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
        addBaseTypeImport(this, "WrapThisAndParameters.mjs", "WrapThisAndParameters");
        return;
      }

      const existingParameters = methodStructure.parameters ?? [];

      methodStructure.parameters = [
        {
          name: "thisObj",
          type: this.interfaceOrAliasName,
        },
        {
          name: "parameters",
          type: `[${
            existingParameters.map(p => WrapThisAndParameters.#serializeParam(p)).join(", ")
          }]`
        }
      ];
    }

    static #serializeParam(param: TS_Parameter): string {
      let rv = param.name;
      const typeData = param.type ? extractType(param.type, true) : undefined;
      if (typeData)
        rv += ": " + typeData;
      return rv;
    }
  }
}

export default WrapThisInnerDecorator;
