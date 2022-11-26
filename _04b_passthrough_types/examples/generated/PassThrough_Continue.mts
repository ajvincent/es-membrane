/* This is generated code.  Do not edit directly.
   Instead, edit the types this file imports.
*/
import { NumberStringType } from "../build/NumberStringType.mjs";
import { PassThroughClassType, PassThroughArgumentType } from "./PassThroughClassType.mjs";

export default class NumberStringClass_PassThroughContinue implements PassThroughClassType
{
  repeatForward(__passThrough__: PassThroughArgumentType<NumberStringType["repeatForward"]>, s: string, n: number): void
  {
    void (s);
    void (n);
  }

  repeatBack(__passThrough__: PassThroughArgumentType<NumberStringType["repeatBack"]>, n: number, s: string): void
  {
    void (n);
    void (s);
  }
}
