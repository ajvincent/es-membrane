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
} from "../../types/export-types.mjs";

import {
  ExtendsAndImplements
} from "../ConfigureStub.mjs";

import extractType from "../utilities/extractType.mjs";

// #endregion preamble

declare const IndeterminateReturnKey: unique symbol;

export type IndeterminateReturnFields = RightExtendsLeft<StaticAndInstance<typeof IndeterminateReturnKey>, {
  staticFields: object,
  instanceFields: object,
  symbolKey: typeof IndeterminateReturnKey
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
          "#stub_classes/source/symbol-keys.mjs",
          "INDETERMINATE",
          false
        );

        this.addImport(
          "#stub_classes/source/types/export-types.mjs",
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
