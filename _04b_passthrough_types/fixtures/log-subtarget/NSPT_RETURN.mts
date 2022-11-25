import type {
  PassThroughType,
  ComponentPassThroughClass,
} from "../../source/exports/internal/PassThroughSupport.mjs";

import type {
  NumberStringType
} from "../NumberStringType.mjs";

import type {
  NumberStringTypeAndLog
} from "./NSPT_ENTRY.mjs";

export default class NSPT_RETURN
               implements ComponentPassThroughClass<NumberStringType, NumberStringTypeAndLog>
{
  repeatBack(
    __passThrough__: PassThroughType<NumberStringType, NumberStringType["repeatBack"], NumberStringTypeAndLog>,
    n: number, s: string
  ): void
  {
    __passThrough__.callTarget("logEnter");
    __passThrough__.setReturnValue(s.repeat(n));
    __passThrough__.callTarget("logLeave");
  }

  repeatForward(
    __passThrough__: PassThroughType<NumberStringType, NumberStringType["repeatForward"], NumberStringTypeAndLog>,
    s: string, n: number
  ) : void
  {
    __passThrough__.callTarget("logEnter");
    __passThrough__.setReturnValue(s.repeat(n));
    __passThrough__.callTarget("logLeave");
  }
}
