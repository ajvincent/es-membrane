import NumberStringClass from "#stage_utilities/fixtures/NumberStringClass.mjs";
import type {
  NumberStringType
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";

import NST_Aspects, {
  type BodyTrapTypes
} from "#aspects/decorators/fixtures/AspectsDecorators.mjs";

import {
  INDETERMINATE
} from "#aspects/decorators/source/symbol-keys.mjs";

import type {
  PrependedIndeterminate
} from "#aspects/decorators/source/types/BodyTrapTypesBase.mjs";

describe("bodyTrap decorator lets us", () => {
  type RepeatForwardLocal = PrependedIndeterminate<
    NumberStringType,
    "repeatForward",
    BodyTrapTypes["repeatForward"]
  >;

  const { bodyTrap } = NST_Aspects;

  it("pass variables", () => {
    const insertedBar = 93;
    let extractedBar = NaN;

    function setBar(
      this: NumberStringType,
      __variables__: BodyTrapTypes["repeatForward"],
      ...parameters: Parameters<NumberStringType["repeatForward"]>
    ): typeof INDETERMINATE
    {
      void(parameters);
      __variables__.bar = insertedBar;
      return INDETERMINATE;
    }
    setBar satisfies RepeatForwardLocal;
  
    function getBar(
      this: NumberStringType,
      __variables__: BodyTrapTypes["repeatForward"],
      ...parameters: Parameters<NumberStringType["repeatForward"]>
    ): typeof INDETERMINATE
    {
      void(parameters);
      extractedBar = __variables__.bar;
      return INDETERMINATE;
    }
    getBar satisfies RepeatForwardLocal;

    class NST_Class extends NumberStringClass {
      @bodyTrap<"repeatForward">(setBar)
      @bodyTrap<"repeatForward">(getBar)
      repeatForward(s: string, n: number): string {
        void(s);
        void(n);
        return super.repeatForward(s, n);
      }
    }

    const nst = new NST_Class;
    expect<string>(nst.repeatForward("foo", 3)).toBe("foofoofoo");
    expect<number>(extractedBar).toBe(insertedBar);
  });

  it("return a value", () => {
    function setBar(
      this: NumberStringType,
      __variables__: BodyTrapTypes["repeatForward"],
      ...parameters: Parameters<NumberStringType["repeatForward"]>
    ): typeof INDETERMINATE
    {
      void(parameters);
      __variables__.bar = 94;
      return INDETERMINATE;
    }
    setBar satisfies RepeatForwardLocal;

    function exitEarly(
      this: NumberStringType,
      __variables__: BodyTrapTypes["repeatForward"],
      s: string,
      n: number,
    ): ReturnType<NumberStringType["repeatForward"]>
    {
      void(__variables__);
      return s.repeat(n);
    }
    exitEarly satisfies RepeatForwardLocal;

    class NST_Class extends NumberStringClass {
      @bodyTrap<"repeatForward">(setBar)
      @bodyTrap<"repeatForward">(exitEarly)
      repeatForward(s: string, n: number): string {
        void(s);
        void(n);
        throw new Error("unreachable");
      }
    }

    const nst = new NST_Class;
    expect<string>(nst.repeatForward("foo", 3)).toBe("foofoofoo");
  });
});
