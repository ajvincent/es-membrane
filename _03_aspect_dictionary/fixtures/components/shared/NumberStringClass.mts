import type { NumberStringType } from "../../types/NumberStringType.mjs";

export default
class NumberStringClass implements NumberStringType
{
  repeatForward(
    s: string,
    n: number
  ): string
  {
    return s.repeat(n);
  }

  repeatBack(
    n: number,
    s: string
  ): string
  {
    return s.repeat(n);
  }
}
