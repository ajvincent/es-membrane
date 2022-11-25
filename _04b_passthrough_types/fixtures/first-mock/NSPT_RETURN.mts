import type {
  PassThroughType,
  ComponentPassThroughClass,
} from "../../source/exports/internal/PassThroughSupport.mjs";

import type {
  NumberStringType
} from "../NumberStringType.mjs";

export default class NSPT_RETURN
               implements ComponentPassThroughClass<NumberStringType, NumberStringType>
{
  repeatBack(
    __passThrough__: PassThroughType<NumberStringType, NumberStringType["repeatBack"], NumberStringType>,
    n: number, s: string
  ) : void
  {
    return __passThrough__.setReturnValue(s.repeat(n));
  }

  repeatForward(
    __passThrough__: PassThroughType<NumberStringType, NumberStringType["repeatForward"], NumberStringType>,
    s: string, n: number
  ) : void
  {
    return __passThrough__.setReturnValue(s.repeat(n));
  }
}
