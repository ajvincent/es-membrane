/* This file is generated.  Do not edit. */
// #region preamble

import {
  type NumberStringType,
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";
import {
  createSpyDecoratorForward,
  createSpyDecoratorBack,
} from "../../components/methodDecorators/spy.mjs";
import {
  type Class,
} from "#mixin_decorators/source/types/Class.mjs";

// #endregion preamble

export default function MethodDecoratedClass
(
  BaseClass: Class<NumberStringType>
): Class<
  NumberStringType
>
{
  const spyForward = createSpyDecoratorForward();
  const spyBack = createSpyDecoratorBack();
  return class NST_SpyMethodDecorated
  extends BaseClass
  implements NumberStringType
  {
    static readonly forwardEvents = spyForward.events;
    static readonly backEvents = spyBack.events;

    @spyForward.spyDecorator
    repeatForward(
      s: string,
      n: number,
    ): string
    {
      return super.repeatForward(s, n);
    }

    @spyBack.spyDecorator
    repeatBack(
      n: number,
      s: string,
    ): string
    {
      return super.repeatBack(n, s);
    }
  }
}
