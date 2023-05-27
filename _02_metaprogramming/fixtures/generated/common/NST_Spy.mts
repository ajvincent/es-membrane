/* This file is generated.  Do not edit. */
// #region preamble

import SpyBase from "../../../../_01_stage_utilities/source/SpyBase.mjs";
import {
  type NumberStringType,
} from "../../types/NumberStringType.mjs";
import {
  type VoidMethodsOnly,
} from "../../../source/stub-generators/base/types/VoidMethodsOnly.mjs";

// #endregion preamble

export default class NumberStringClass_Spy
implements VoidMethodsOnly<NumberStringType>
{
  readonly #spyClass = new SpyBase;

  repeatForward(
    s: string,
    n: number,
  ): void
  {
    this.#spyClass.getSpy("repeatForward")(s, n);
  }

  repeatBack(
    n: number,
    s: string,
  ): void
  {
    this.#spyClass.getSpy("repeatBack")(n, s);
  }
}
