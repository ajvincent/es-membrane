import type { MethodsOnly } from "../../../source/draft-20230323/AspectDecorators.mjs";
import type { NumberStringType } from "../../types/NumberStringType.mjs";

export default
class NumberStringClass implements MethodsOnly<NumberStringType>
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
