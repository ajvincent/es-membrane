// #region preamble

import type {
  OptionalKind,
  ParameterDeclarationStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#stage_utilities/source/types/StaticAndInstance.mjs";

import type {
  ConfigureStubDecorator,
  TS_Method,
} from "#stub_classes/source/base/types/export-types.mjs";

import {
  ExtendsAndImplements
} from "#stub_classes/source/base/ConfigureStub.mjs";
import extractType from "#stub_classes/source/base/utilities/extractType.mjs";

import type {
  MethodReturnRewrite,
} from "#stub_classes/source/base/types/export-types.mjs";

import type {
  MethodsOnlyInternal
} from "#stub_classes/source/base/types/MethodsOnlyInternal.mjs";

import {
  INDETERMINATE,
} from "#aspect_weaving/source/symbol-keys.mjs";
// #endregion preamble

export type IndeterminateClass<T extends MethodsOnlyInternal> = MethodReturnRewrite<T, typeof INDETERMINATE, true>;
export {
  INDETERMINATE
};

export type IndeterminateReturnFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: object
}>;

const IndeterminateReturnDecorator: ConfigureStubDecorator<IndeterminateReturnFields, false> = function(
  this: void,
  baseClass
)
{
  return class extends baseClass {
    protected getExtendsAndImplementsTrap(context: Map<symbol, unknown>): ExtendsAndImplements {
      const extendsAndImplements = super.getExtendsAndImplementsTrap(context);

      return {
        extends: extendsAndImplements.extends,
        implements: extendsAndImplements.implements.map(
          _implements => `IndeterminateClass<${_implements}>`
        ),
      };
    }

    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void
    {
      super.methodTrap(methodStructure, isBefore);

      if (!isBefore)
        return;

      if (!methodStructure) {
        this.addImport(
          "#aspect_weaving/source/stub-decorators/IndeterminateReturn.mjs",
          "INDETERMINATE",
          false
        );

        this.addImport(
          "#aspect_weaving/source/stub-decorators/IndeterminateReturn.mjs",
          "type IndeterminateClass",
          false
        );

        return;
      }

      const returnType = extractType(methodStructure.returnType ?? "void", true) as string;
      methodStructure.returnType = returnType + " | typeof INDETERMINATE";
    }

    protected buildMethodBodyTrap(
      structure: TS_Method,
      remainingArgs: Set<OptionalKind<ParameterDeclarationStructure>>
    ): void
    {
      void(structure);
      this.voidArguments(remainingArgs);
      this.classWriter.writeLine(`return INDETERMINATE;`);
    }
  }
}

export default IndeterminateReturnDecorator;
