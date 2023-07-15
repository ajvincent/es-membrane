/* This file is generated.  Do not edit. */
// #region preamble

import SharedAssertSet, {
  unsharedAssert,
} from "#stage_utilities/source/SharedAssertSet.mjs";
import {
  type UnshiftableArray,
} from "#stage_utilities/source/types/Utility.mjs";
import {
  type NumberStringType,
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";
import {
  type Class,
} from "type-fest";
import {
  type AssertFunction,
  type SharedAssertionObserver,
} from "#stage_utilities/source/types/assert.mjs";

// #endregion preamble

export default function ClassInvariantsWrapper
(
  baseClass: Class<NumberStringType>, invariantsArray: UnshiftableArray<(this: NumberStringType) => void>
): Class<
  NumberStringType & SharedAssertionObserver
>
{
  return class NumberStringClass_ClassInvariants
  extends baseClass
  implements NumberStringType, SharedAssertionObserver
  {
    static readonly #invariantsArray: ReadonlyArray<(this: NumberStringType) => void> = invariantsArray;

    #assertFailed = false;
    get assert(): AssertFunction {
      return unsharedAssert;
    }
    set assert(newAssert: AssertFunction) {
      Reflect.defineProperty(this, "assert", 
        {
          value: newAssert,
          writable: false,
          enumerable: true,
          configurable: false
        }
      );
    }

    constructor(
      __sharedAssert__: SharedAssertSet,
      ...parameters: ConstructorParameters<typeof baseClass>
    )
    {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...parameters);
      __sharedAssert__.buildShared(this);
    }

    #abortIfAssertFailed(
    ): void
    {
      if (this.#assertFailed) {
        throw new Error("An assertion has already failed.  This object is dead.");
      }
    }

    observeAssertFailed(
      forSelf: boolean,
    ): void
    {
      void(forSelf);
      this.#assertFailed = true;
    }

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
      this.#abortIfAssertFailed();
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
      this.#abortIfAssertFailed();
      this.#runInvariants();
      const __rv__ = super.repeatBack(n, s);
      this.#runInvariants();
      return __rv__;
    }
  }
}
