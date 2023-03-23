import { NumberStringType } from "../../fixtures/NumberStringType.mjs";
import { NumberStringVoid } from "../../fixtures/NumberStringVoid.mjs";

import NumberStringClass from "../../fixtures/NumberStringClass.mjs";

import {
  Aspects,
} from "../../source/AspectDecorators.mjs";

describe("AspectDecorators: compile tests, ", () => {
  const nstVoid: NumberStringVoid = {
    repeatForward(s, n) {
      void(s);
      void(n);
    },
    repeatBack(n, s) {
      void(n);
      void(s);
    },
  };

  class NSC_Aspects extends NumberStringClass
  {
    constructor() {
      super();
    }

    invariants: Aspects<NumberStringType> | undefined;

    repeatForward(s: string, n: number): string
    {
      nstVoid.repeatForward(s, n);

      const rv = super.repeatForward.call<
        NumberStringType,
        Parameters<NumberStringType["repeatForward"]>,
        ReturnType<NumberStringType["repeatForward"]>
      >(this, s, n);

      nstVoid.repeatForward(s, n);

      return rv;
    }

    repeatBack(n: number, s: string): string
    {
      nstVoid.repeatBack(n, s);
      const rv = super.repeatBack(n, s);
      nstVoid.repeatBack(n, s);
      return rv;
    }
  }

  it("NumberStringClass", () => {
    expect(new NumberStringClass).toBeTruthy();
  });

  it("NumberStringVoid", () => {
    expect(nstVoid).toBeTruthy();
  });

  it("NSC_Aspects", () => {
    expect(NSC_Aspects).toBeTruthy();
  });
});
