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

import type {
  TS_Method
} from "../../types/export-types.mjs";

import addBaseTypeImport from "../utilities/addBaseTypeImport.mjs";

// #endregion preamble

export type PrependReturnFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: object,
}>;

const PrependReturnDecorator: ConfigureStubDecorator<PrependReturnFields, false> = function(
  this: void,
  baseClass
)
{
  return class extends baseClass {
    protected getExtendsAndImplementsTrap(context: Map<symbol, unknown>): ExtendsAndImplements
    {
      const inner = super.getExtendsAndImplementsTrap(context);
      return {
        extends: inner.extends,
        implements: inner.implements.map(value => `MethodsPrependReturn<${value}>`),
      };
    }
  
    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean,
    ) : void
    {
      super.methodTrap(methodStructure, isBefore);

      if (!isBefore)
        return;

      if (!methodStructure) {
        addBaseTypeImport(
          this, "MethodsPrependReturn.mjs", "MethodsPrependReturn"
        );
        return;
      }

      methodStructure.parameters ||= [];
      methodStructure.parameters.unshift({
        name: "__rv__",
        type: methodStructure.returnType,
      });
    }
  }
}

export default PrependReturnDecorator;
