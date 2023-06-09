/* This file is generated.  Do not edit. */
// #region preamble

import {
  type NumberStringType,
} from "../../types/NumberStringType.mjs";
import {
  type TransitionInterface,
} from "../../../../_02_stub_classes/source/transitions/types/TransitionInterface.mjs";

// #endregion preamble

export default class NumberStringClass_Transitions_Middle
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
    return s_tail.repeat(n_tail);
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
    return s_tail.repeat(n_tail);
  }
}
