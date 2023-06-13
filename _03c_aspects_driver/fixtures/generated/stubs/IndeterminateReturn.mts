/* This file is generated.  Do not edit. */
// #region preamble

import {
  type NumberStringType,
} from "../../types/NumberStringType.mjs";
import {
  INDETERMINATE,
} from "#stub_classes/source/symbol-keys.mjs";
import {
  type IndeterminateClass,
} from "#stub_classes/source/types/export-types.mjs";

// #endregion preamble

export default class NumberStringClass_IndeterminateReturn
implements IndeterminateClass<NumberStringType>
{
  repeatForward(
    s: string,
    n: number,
  ): string | typeof INDETERMINATE
  {
    void(s);
    void(n);
    return INDETERMINATE;
  }

  repeatBack(
    n: number,
    s: string,
  ): string | typeof INDETERMINATE
  {
    void(n);
    void(s);
    return INDETERMINATE;
  }
}
