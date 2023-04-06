import type { NumberStringType } from "../../types/NumberStringType.mjs";
import { TransitionInterface } from "../../../source/aspects/public-types/TransitionInterface.mjs";

export default class NST_Transition
implements TransitionInterface<NumberStringType, [boolean, object]>
{
  repeatForward(s1: string, n1: number, m0: boolean, m1: object, s2: string, n2: number): string {
    return s2.repeat(n2);
  }

  repeatBack(n1: number, s1: string, m0: boolean, m1: object, n2: number, s2: string): string {
    return s2.repeat(n2);
  }
}
