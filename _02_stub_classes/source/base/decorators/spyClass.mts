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
  TS_Method,
  TS_Parameter,
} from "../../types/export-types.mjs";

import type {
  ExtendsAndImplements
} from "../ConfigureStub.mjs";

// #endregion preamble


export type SpyClassFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: object,
}>;

const SpyClassDecorator: ConfigureStubDecorator<SpyClassFields, false> = function(
  this: void,
  baseClass
)
{
  return class extends baseClass {
    protected getExtendsAndImplementsTrap(context: Map<symbol, unknown>): ExtendsAndImplements {
      const __rv__ = super.getExtendsAndImplementsTrap(context);
      return {
        ...__rv__,
        implements: __rv__.implements.concat("HasSpy")
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
        this.addImport("#stub_classes/source/symbol-keys.mjs", "SPY_BASE", false);
        this.addImport("#stage_utilities/source/SpyBase.mjs", "SpyBase", true);
        this.addImport("#stub_classes/source/base/mixins/spyClass.mjs", "type HasSpy", false);

        this.classWriter.writeLine(
          `readonly [SPY_BASE] = new SpyBase;`
        );
        this.classWriter.newLine();
        return;
      }
    }

    protected buildMethodBodyTrap(
      structure: TS_Method,
      remainingArgs: Set<TS_Parameter>,
    ): void
    {
      const paramsStr = structure.parameters?.map(
        param  => param.name
      ).join(", ") ?? "";

      this.classWriter.writeLine(
        `this[SPY_BASE].getSpy("${structure.name}")(this.#wrapped, ${paramsStr});`
      );
      remainingArgs.clear();

      super.buildMethodBodyTrap(structure, remainingArgs);
    }
  }
}

export default SpyClassDecorator;
