/* This file is generated.  Do not edit. */
// #region preamble

import {
  type NumberStringType,
} from "#aspects/test-fixtures/fixtures/types/NumberStringType.mjs";
import {
  type TransitionInterface,
} from "#aspects/stubs/source/types/TransitionInterface.mjs";

// #endregion preamble

export default class NumberStringClass_Transitions_NI
implements TransitionInterface<NumberStringType, [boolean, () => Promise<void>]>
{
  repeatForward(
    s: string,
    n: number,
    m1: boolean,
    m2: () => Promise<void>,
    s_tail: string,
    n_tail: number,
  ): string
  {
    void(s);
    void(n);
    void(m1);
    void(m2);
    void(s_tail);
    void(n_tail);
    throw new Error("not yet implemented");
  }

  repeatBack(
    n: number,
    s: string,
    m1: boolean,
    m2: () => Promise<void>,
    n_tail: number,
    s_tail: string,
  ): string
  {
    void(n);
    void(s);
    void(m1);
    void(m2);
    void(n_tail);
    void(s_tail);
    throw new Error("not yet implemented");
  }
}
