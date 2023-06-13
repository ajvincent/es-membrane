/* This file is generated.  Do not edit. */
// #region preamble

import {
  type NumberStringType,
} from "../../types/NumberStringType.mjs";
import {
  type MethodsPrependReturn,
} from "#stub_classes/source/base/types/MethodsPrependReturn.mjs";
import {
  type VoidMethodsOnly,
} from "#stub_classes/source/base/types/VoidMethodsOnly.mjs";

// #endregion preamble

export default class NumberStringClass_PrependReturn
implements VoidMethodsOnly<MethodsPrependReturn<NumberStringType>>
{
  repeatForward(
    __rv__: string,
    s: string,
    n: number,
  ): void
  {
    void(__rv__);
    void(s);
    void(n);
  }

  repeatBack(
    __rv__: string,
    n: number,
    s: string,
  ): void
  {
    void(__rv__);
    void(n);
    void(s);
  }
}
