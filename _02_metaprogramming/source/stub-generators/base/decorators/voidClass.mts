// #region preamble

import type {
  RightExtendsLeft
} from "../../../../../_01_stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "../../../../../_01_stage_utilities/source/types/StaticAndInstance.mjs";

import type {
  ConfigureStubDecorator
} from "../types/ConfigureStubDecorator.mjs";

import type {
  ExtendsAndImplements
} from "../baseStub.mjs";

import type {
  TS_Method
} from "../private-types.mjs";

import addPublicTypeImport from "../addPublicTypeImport.mjs";
import { OptionalKind, ParameterDeclarationStructure } from "ts-morph";

// #endregion preamble

export type VoidClassFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: object,
}>;

const VoidClassDecorator: ConfigureStubDecorator<VoidClassFields> = function(
  this: void,
  baseClass
)
{
  return class extends baseClass {
    protected getExtendsAndImplements(): ExtendsAndImplements
    {
      const inner = super.getExtendsAndImplements();
      return {
        extends: inner.extends,
        implements: inner.implements.map(value => `VoidMethodsOnly<${value}>`),
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
        addPublicTypeImport(this, "VoidMethodsOnly.mjs", "VoidMethodsOnly");
        return;
      }

      methodStructure.returnType = "void";
    }


    protected buildMethodBody(
      methodStructure: TS_Method,
      remainingArgs: Set<OptionalKind<ParameterDeclarationStructure>>,
    ): void
    {
      this.voidArguments(remainingArgs);
      super.buildMethodBody(methodStructure, remainingArgs);
    }
  }
}

export default VoidClassDecorator;
