// #region preamble

import {
  type NumberStringType,
} from "../types/NumberStringType.mjs";

import {
  INDETERMINATE
} from "#stub_classes/source/symbol-keys.mjs";

import type {
  IndeterminateClass,
} from "#stub_classes/source/types/export-types.mjs";

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
