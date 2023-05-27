import type { NumberStringType } from "../../types/NumberStringType.mjs";
import { TransitionInterface } from "../../../source/transitions/types/TransitionInterface.mjs";

export default class NumberStringClass_Transitions_Tail
implements TransitionInterface<NumberStringType, [boolean, () => Promise<void>]>
{
  readonly #nextHandler: NumberStringType;

  constructor(
    nextHandler: NumberStringType,
  )
  {
    this.#nextHandler = nextHandler;
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
