import BaseStub, {
  type ExtendsAndImplements
} from "./baseStub.mjs";
import addPublicTypeImport from "./addPublicTypeImport.mjs";

import {
  assertDefined,
  isNotDefined,
  markDefined,
  NOT_DEFINED,
  type MaybeDefined,
} from "../../../../_01_stage_utilities/source/maybeDefined.mjs";

import type {
  TS_Method
} from "./private-types.mjs";

type NI_Setting = {
  useNever: boolean
};

export default
class NotImplementedStub extends BaseStub
{
  #notImplementedSetting: MaybeDefined<NI_Setting> = NOT_DEFINED;

  setNotImplementedOnly(useNever: boolean) : void
  {
    if (!isNotDefined(this.#notImplementedSetting))
      throw new Error("You've called setNotImplementedOnly already");
    this.#notImplementedSetting = markDefined({useNever});
  }

  buildClass() : void
  {
    assertDefined(this.#notImplementedSetting);
    super.buildClass();
  }

  protected getExtendsAndImplements(): ExtendsAndImplements
  {
    if (isNotDefined(this.#notImplementedSetting))
      throw new Error("assertion failure")

    return {
      extends: [],
      implements: [
        this.#notImplementedSetting.useNever ? `NotImplementedOnly<${this.interfaceOrAliasName}>` : this.interfaceOrAliasName
      ],
    };
  }

  protected methodTrap(
    methodStructure: TS_Method | null,
    isBefore: boolean,
  ) : void
  {
    if (isNotDefined(this.#notImplementedSetting))
      throw new Error("assertion failure");
    if (!this.#notImplementedSetting.useNever || !isBefore)
      return;

    if (!methodStructure) {
      addPublicTypeImport(
        this, "NotImplementedOnly.mjs", "NotImplementedOnly"
      );
      return;
    }

    methodStructure.returnType = "never";
  }

  protected buildMethodBody(
    methodStructure: TS_Method
  ): void
  {
    if (methodStructure.parameters) {
      methodStructure.parameters.forEach(
        param => this.classWriter.writeLine(`void(${param.name});`)
      );
    }

    this.classWriter.writeLine(`throw new Error("not yet implemented");`);
  }
}