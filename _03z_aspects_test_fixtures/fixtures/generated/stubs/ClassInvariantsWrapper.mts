/* This file is generated.  Do not edit. */
// #region preamble

import {
  type NumberStringType,
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";
import {
  type Class,
} from "#mixin_decorators/source/types/Class.mjs";
import {
  CLASS_INVARIANTS,
} from "#aspects/stubs/source/symbol-keys.mjs";
import {
  type UnshiftableArray,
} from "#stage_utilities/source/types/Utility.mjs";

// #endregion preamble

export default function ClassInvariantsWrapper
(
  BaseClass: Class<NumberStringType>
): Class<
  NumberStringType
> & { readonly [CLASS_INVARIANTS]: UnshiftableArray<(this: NumberStringType) => void> }
{
  return class NumberStringClass_ClassInvariants
  extends BaseClass
  implements NumberStringType
  {
    static readonly [CLASS_INVARIANTS]: UnshiftableArray<(this: NumberStringType) => void> = [];

    #runInvariants(
    ): void
    {
      NumberStringClass_ClassInvariants[CLASS_INVARIANTS].forEach(invariant => invariant.apply(this));
    }

    repeatForward(
      s: string,
      n: number,
    ): string
    {
      this.#runInvariants()
      const __rv__ = super.repeatForward(s, n);
      this.#runInvariants()
      return __rv__;
    }

    repeatBack(
      n: number,
      s: string,
    ): string
    {
      this.#runInvariants()
      const __rv__ = super.repeatBack(n, s);
      this.#runInvariants()
      return __rv__;
    }
  }
}
