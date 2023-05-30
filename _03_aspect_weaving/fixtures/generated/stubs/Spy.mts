/* This file is generated.  Do not edit. */
// #region preamble

import SpyBase from "../../../../_01_stage_utilities/source/SpyBase.mjs";
import NumberStringClass_Spy_WrapThisInner from "./WrapThisInner.mjs";
import {
  type NumberStringType,
} from "../../types/NumberStringType.mjs";
import {
  SPY_BASE,
} from "#stub_classes/source/symbol-keys.mjs";
import {
  type WrapThisAndParameters,
} from "../../../../_02_stub_classes/source/base/types/WrapThisAndParameters.mjs";
import {
  type VoidMethodsOnly,
} from "../../../../_02_stub_classes/source/base/types/VoidMethodsOnly.mjs";

// #endregion preamble

export default class NumberStringClass_Spy
extends NumberStringClass_Spy_WrapThisInner
implements VoidMethodsOnly<WrapThisAndParameters<NumberStringType>>
{
  readonly [SPY_BASE] = new SpyBase;

  repeatForward(
    thisObj: NumberStringType,
    parameters: [s: string, n: number],
  ): void
  {
    void(thisObj);
    void(parameters);
    this[SPY_BASE].getSpy("repeatForward")(thisObj, parameters);
  }

  repeatBack(
    thisObj: NumberStringType,
    parameters: [n: number, s: string],
  ): void
  {
    void(thisObj);
    void(parameters);
    this[SPY_BASE].getSpy("repeatBack")(thisObj, parameters);
  }
}
