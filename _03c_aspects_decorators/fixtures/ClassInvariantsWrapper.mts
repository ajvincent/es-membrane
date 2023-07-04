/* This file is generated.  Do not edit. */
// #region preamble

import {
  type UnshiftableArray,
} from "#stage_utilities/source/types/Utility.mjs";
import {
  type NumberStringType,
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";
import {
  type Class,
} from "#mixin_decorators/source/types/Class.mjs";

// #endregion preamble

export default function ClassInvariantsWrapper
(
  baseClass: Class<NumberStringType>, invariantsArray: UnshiftableArray<(this: NumberStringType) => void>
): Class<
  NumberStringType
>
{
  return class NumberStringClass_ClassInvariants
  extends baseClass
  implements NumberStringType
  {
    static readonly #invariantsArray: ReadonlyArray<(this: NumberStringType) => void> = invariantsArray;

    #runInvariants(
    ): void
    {
      NumberStringClass_ClassInvariants.#invariantsArray.forEach(invariant => invariant.apply(this));
    }

    repeatForward(
      s: string,
      n: number,
    ): string
    {
      this.#runInvariants();
      const __rv__ = super.repeatForward(s, n);
      this.#runInvariants();
      return __rv__;
    }

    repeatBack(
      n: number,
      s: string,
    ): string
    {
      this.#runInvariants();
      const __rv__ = super.repeatBack(n, s);
      this.#runInvariants();
      return __rv__;
    }
  }
}
