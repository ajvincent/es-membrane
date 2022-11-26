import type { NumberStringType } from "../build/NumberStringType.mjs";
import type {
  PassThroughClassType,
  PassThroughArgumentType
} from "../generated/internal/PassThroughClassType.mjs";

export default class MainBody
  implements PassThroughClassType
{
  repeatForward(
    __passThrough__: PassThroughArgumentType<NumberStringType["repeatForward"]>,
    s: string,
    n: number,
  ): void
  {
    return __passThrough__.setReturnValue(s.repeat(n));
  }

  repeatBack(
    __passThrough__: PassThroughArgumentType<NumberStringType["repeatBack"]>,
    n: number,
    s: string
  ): void
  {
    return __passThrough__.setReturnValue(s.repeat(n));
  }
}
