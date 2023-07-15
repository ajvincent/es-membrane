/* This file is generated.  Do not edit. */
// #region preamble

import {
  type NumberStringType,
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";
import {
  type Class,
} from "type-fest";
import {
  type TransitionInterface,
} from "#aspects/stubs/source/types/TransitionInterface.mjs";

// #endregion preamble

type NST_MiddleParameters = [boolean, () => Promise<void>];

export default function TransitionsHeadClass
(
  BaseClass: Class<TransitionInterface<true, NumberStringType, NST_MiddleParameters>, []>
): Class<
  NumberStringType
>
{
  return class NumberStringClass_Transitions_Head
  implements NumberStringType
  {
    readonly #nextHandler: TransitionInterface<true, NumberStringType, NST_MiddleParameters>;

    constructor(
      ...parameters: ConstructorParameters<typeof BaseClass>
    )
    {
      this.#nextHandler = new BaseClass(...parameters);
    }

    repeatForward(
      s: string,
      n: number,
    ): string
    {
      const m1 = false;
      const m2: () => Promise<void> = () => Promise.resolve();
      const s_tail = s + "_tail";
      const n_tail = n + 1;
      return this.#nextHandler.repeatForward(
        s, n, m1, m2, s_tail, n_tail
      );
    }

    repeatBack(
      n: number,
      s: string,
    ): string
    {
      const m1 = false;
      const m2: () => Promise<void> = () => Promise.resolve();
      const n_tail = n + 1;
      const s_tail = s + "_tail";
      return this.#nextHandler.repeatBack(
        n, s, m1, m2, n_tail, s_tail
      );
    }
  }
}
