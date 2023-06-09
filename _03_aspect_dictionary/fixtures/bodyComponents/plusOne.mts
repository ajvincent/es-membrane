// #region preamble

import {
  type NumberStringType,
} from "../types/NumberStringType.mjs";
import {
  INDETERMINATE,
  type IndeterminateClass
} from "#aspect_dictionary/source/stubs/decorators/IndeterminateReturn.mjs";

// #endregion preamble

export default class NumberStringClass_PlusOneCopy
implements IndeterminateClass<NumberStringType>
{
  repeatForward(
    s: string,
    n: number,
  ): string | typeof INDETERMINATE
  {
    return s.repeat(n + 1);
  }

  repeatBack(
    n: number,
    s: string,
  ): string | typeof INDETERMINATE
  {
    return s.repeat(n + 1);
  }
}
