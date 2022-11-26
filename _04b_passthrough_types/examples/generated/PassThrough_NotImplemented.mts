/* This is generated code.  Do not edit directly.
   Instead, edit the types this file imports.
*/
import { NumberStringType } from "../build/NumberStringType.mjs";
import { PassThroughClassType, PassThroughArgumentType } from "./PassThroughClassType.mjs";

export default class NumberStringClass_PassThroughNI implements PassThroughClassType
{
  repeatForward(__passThrough__: PassThroughArgumentType<NumberStringType["repeatForward"]>, s: string, n: number): void
  {
    void (s);
    void (n);
    throw new Error("not yet implemented");
  }

  repeatBack(__passThrough__: PassThroughArgumentType<NumberStringType["repeatBack"]>, n: number, s: string): void
  {
    void (n);
    void (s);
    throw new Error("not yet implemented");
  }
}
