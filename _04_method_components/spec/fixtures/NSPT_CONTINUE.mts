import type {
  PassThroughType,
  ComponentPassThroughClass,
} from "../../source/PassThroughSupport.mjs";

import type {
  NumberStringType
} from "./NumberStringType.mjs";

export class NSPT_CONTINUE implements ComponentPassThroughClass<NumberStringType> {
  repeatBack(
    __previousResults__: PassThroughType<NumberStringType["repeatBack"]>,
    n: number, s: string
  ): string | PassThroughType<NumberStringType["repeatBack"]>
  {
    void(n);
    void(s);
    return __previousResults__;
  }

  repeatForward(
    __previousResults__: PassThroughType<NumberStringType["repeatForward"]>,
    s: string, n: number
  ): string | PassThroughType<NumberStringType["repeatForward"]>
  {
    void(s);
    void(n);
    return __previousResults__;
  }
}
