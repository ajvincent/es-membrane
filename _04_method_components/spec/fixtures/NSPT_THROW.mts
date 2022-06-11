import type {
  PassThroughType,
  ComponentPassThroughClass,
} from "../../source/PassThroughSupport.mjs";

import type {
  NumberStringType
} from "./NumberStringType.mjs";

export class NSPT_THROW implements ComponentPassThroughClass<NumberStringType> {
  repeatForward(
    __previousResults__: PassThroughType<NumberStringType["repeatForward"]>,
    s: string, n: number
  ): string | PassThroughType<NumberStringType["repeatForward"]>
  {
    void(s);
    void(n);
    throw new Error("repeatForward throw");
  }

  repeatBack(
    __previousResults__: PassThroughType<NumberStringType["repeatBack"]>,
    n: number, s: string
  ): string | PassThroughType<NumberStringType["repeatBack"]>
  {
    void(n);
    void(s);
    throw new Error("repeatBack throw");
  }
}
