/* This file is generated.  Do not edit. */
// #region preamble

import SpyBase from "#stage_utilities/source/SpyBase.mjs";
import {
  type NumberStringType,
} from "../../types/NumberStringType.mjs";
import {
  type VoidMethodsOnly,
} from "../../../../_02_stub_classes/source/base/types/VoidMethodsOnly.mjs";
import {
  SPY_BASE,
} from "#stub_classes/source/symbol-keys.mjs";
import {
  type HasSpy,
} from "#stub_classes/source/base/spyClass.mjs";

// #endregion preamble

export default class NumberStringClass_Spy
implements VoidMethodsOnly<NumberStringType>, HasSpy
{
  readonly [SPY_BASE] = new SpyBase;

  readonly #wrapped: NumberStringType

  constructor(wrapped: NumberStringType) {
    this.#wrapped = wrapped;
  }

  repeatForward(
    s: string,
    n: number,
  ): void
  {
    this[SPY_BASE].getSpy("repeatForward")(this.#wrapped, s, n);
  }

  repeatBack(
    n: number,
    s: string,
  ): void
  {
    this[SPY_BASE].getSpy("repeatBack")(this.#wrapped, n, s);
  }
}
