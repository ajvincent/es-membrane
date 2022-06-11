import type {
  PassThroughType,
  ComponentPassThroughClass,
} from "../../source/PassThroughSupport.mjs";

import type {
  NumberStringType
} from "./NumberStringType.mjs";

export class NSPT_RETURN implements ComponentPassThroughClass<NumberStringType> {
  repeatBack(
    __previousResults__: PassThroughType<NumberStringType["repeatBack"]>,
    n: number, s: string
  ): string | PassThroughType<NumberStringType["repeatBack"]>
  {
    void(__previousResults__);
    return s.repeat(n);
  }

  repeatForward(
    __previousResults__: PassThroughType<NumberStringType["repeatForward"]>,
    s: string, n: number
  ): string | PassThroughType<NumberStringType["repeatForward"]>
  {
    void(__previousResults__);
    return s.repeat(n);
  }
}
