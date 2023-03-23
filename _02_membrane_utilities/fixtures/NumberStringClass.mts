import type { MethodsOnly } from "../source/AspectDecorators.mjs";
import type { NumberStringType } from "./NumberStringType.mjs";

export default
class NumberStringClass implements MethodsOnly<NumberStringType>
{
  repeatForward(s: string, n: number) : string
  {
    return s.repeat(n);
  }

  repeatBack(n: number, s: string) : string
  {
    return s.repeat(n);
  }
}
