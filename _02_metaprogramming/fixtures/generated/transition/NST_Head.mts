import type { NumberStringType } from "../../types/NumberStringType.mjs";
import { TransitionInterface } from "../../../source/stub-generators/transitions/types/TransitionInterface.mjs";

type NST_MiddleParameters = [boolean, () => Promise<void>];

export default class NumberStringClass_Transitions_Head
implements NumberStringType
{
  readonly #nextHandler: TransitionInterface<NumberStringType, NST_MiddleParameters>;

  constructor(
    nextHandler: TransitionInterface<NumberStringType, NST_MiddleParameters>,
  )
  {
    this.#nextHandler = nextHandler;
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
