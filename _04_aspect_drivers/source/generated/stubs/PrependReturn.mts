/* This file is generated.  Do not edit. */
// #region preamble

import {
  type NumberStringType,
} from "../../../fixtures/types/NumberStringType.mjs";
import {
  type VoidMethodsOnly,
} from "#stub_classes/source/base/types/VoidMethodsOnly.mjs";
import {
  type MethodsPrependReturn,
} from "#stub_classes/source/base/types/MethodsPrependReturn.mjs";

// #endregion preamble

export default class NumberStringClass_PrependReturn
implements MethodsPrependReturn<VoidMethodsOnly<NumberStringType>>
{
  repeatForward(
    __rv__: void,
    s: string,
    n: number,
  ): void
  {
    void(__rv__);
    void(s);
    void(n);
  }

  repeatBack(
    __rv__: void,
    n: number,
    s: string,
  ): void
  {
    void(__rv__);
    void(n);
    void(s);
  }
}
