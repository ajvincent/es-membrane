/* This file is generated.  Do not edit. */
// #region preamble

import {
  type NumberStringType,
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";
import {
  type Class,
} from "#mixin_decorators/source/types/Class.mjs";
import {
  type TransitionInterface,
} from "#aspects/stubs/source/types/TransitionInterface.mjs";

// #endregion preamble

export default function TransitionsTailClass
(
  BaseClass: Class<NumberStringType, []>
): Class<
  TransitionInterface<true, NumberStringType, [boolean, () => Promise<void>]>
>
{
  return class NumberStringClass_Transitions_Tail
  implements TransitionInterface<true, NumberStringType, [boolean, () => Promise<void>]>
  {
    readonly #nextHandler: NumberStringType;

    constructor(
      ...parameters: ConstructorParameters<typeof BaseClass>
    )
    {
      this.#nextHandler = new BaseClass(...parameters);
    }

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
      return this.#nextHandler.repeatForward(s_tail, n_tail);
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
      return this.#nextHandler.repeatBack(n_tail, s_tail);
    }
  }
}
