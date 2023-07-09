import type {
  NumberStringType
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";

import type {
  AssertInterface
} from "#stage_utilities/source/SharedAssertSet.mjs";

import NST_Aspects, {
  type SharedVariablesMap,
} from "#aspects/decorators/fixtures/AspectsDecorators.mjs";

import {
  INDETERMINATE,
  RETURN_NOT_REPLACED,
} from "#aspects/decorators/source/symbol-keys.mjs";

import {
  PreconditionContext,
  PostconditionContext,
} from "#aspects/decorators/source/types/PrePostConditionsContext.mjs";

import NumberStringClass from "#aspects/decorators/fixtures/NumberStringClassAssert.mjs";


it("Multiple aspect decorators can apply to a class, in the right order", () => {
  const {
    argumentsTrap,
    bodyTrap,
    returnTrap,

    preCondition,
    postCondition,
    prePostCondition,
  } = NST_Aspects;

  // #region a whole bunch of aspects
  const argumentsTrapForwardSpy = jasmine.createSpy();

  function callForwardSpy(
    this: NumberStringType,
    context: object,
    ...parameters: Parameters<NumberStringType["repeatForward"]>
  ): void
  {
    void(context);
    argumentsTrapForwardSpy(this, ...parameters);
    if (parameters[1] < 0)
      throw new Error("negative numbers don't work");
  }

  function setBar(
    this: NumberStringType,
    __variables__: SharedVariablesMap["repeatForward"],
    ...parameters: Parameters<NumberStringType["repeatForward"]>
  ): typeof INDETERMINATE
  {
    void(parameters);
    __variables__.bar = 67;
    return INDETERMINATE;
  }

  function getBar(
    this: NumberStringType,
    __variables__: SharedVariablesMap["repeatForward"],
    ...parameters: Parameters<NumberStringType["repeatForward"]>
  ): typeof INDETERMINATE
  {
    void(parameters);
    expect(__variables__.bar).toBe(67);
    return INDETERMINATE;
  }

  function exitEarly(
    this: NumberStringType,
    __variables__: SharedVariablesMap["repeatForward"],
    s: string,
    n: number,
  ): ReturnType<NumberStringType["repeatForward"]>
  {
    void(__variables__);
    return s.repeat(n + 1);
  }

  const returnTrapForwardSpy = jasmine.createSpy();

  function returnForwardSpy(
    this: NumberStringType,
    context: object,
    __rv__: string,
    ...parameters: Parameters<NumberStringType["repeatForward"]>
  ): typeof RETURN_NOT_REPLACED
  {
    void(context);
    returnTrapForwardSpy(this, __rv__, ...parameters);
    if (__rv__ === "")
      throw new Error("result is empty");
    return RETURN_NOT_REPLACED;
  }

  function forwardPreconditionNoContext(
    this: NumberStringType & AssertInterface,
    s: string,
    n: number,
  ): void {
    this.assert(n >= 0, "precondition error");
    void(s);
  }

  function forwardPostconditionNoContext(
    this: NumberStringType & AssertInterface,
    returnValue: ReturnType<NumberStringType["repeatForward"]>,
    ...parameters: Parameters<NumberStringType["repeatForward"]>
  ): void
  {
    void(parameters);
    this.assert(returnValue !== "", "postcondition error");
  }

  function forwardPreconditionWithContext(
    this: NumberStringType & AssertInterface,
    contextSetter: PreconditionContext<boolean>,
    s: string,
    n: number,
  ): void {
    this.assert(n >= 0, "precondition error");
    void(s);
    contextSetter.set(true);
  }

  function forwardPostconditionWithContext(
    this: NumberStringType & AssertInterface,
    contextGetter: PostconditionContext<boolean>,
    returnValue: ReturnType<NumberStringType["repeatForward"]>,
    ...parameters: Parameters<NumberStringType["repeatForward"]>
  ): void
  {
    void(parameters);
    void(contextGetter.get());
    this.assert(returnValue !== "", "postcondition error");
  }
  // #endregion a whole bunch of aspects

  expect(() => {
    void(class extends NumberStringClass {
      @prePostCondition<"repeatForward", boolean>(forwardPreconditionWithContext, forwardPostconditionWithContext)
      @preCondition<"repeatForward">(forwardPreconditionNoContext)
      @postCondition<"repeatForward">(forwardPostconditionNoContext)
      @argumentsTrap<"repeatForward">(callForwardSpy)
      @bodyTrap<"repeatForward">(setBar)
      @bodyTrap<"repeatForward">(getBar)
      @bodyTrap<"repeatForward">(exitEarly)
      @returnTrap<"repeatForward">(returnForwardSpy)
      repeatForward(s: string, n: number): string
      {
        return super.repeatForward(s, n);
      }

      repeatBack(n: number, s: string): string
      {
        return super.repeatBack(n, s);
      }
    });
  }).not.toThrow();

  expect(() => {
    void(class extends NumberStringClass {
      @preCondition<"repeatForward">(forwardPreconditionNoContext)
      @postCondition<"repeatForward">(forwardPostconditionNoContext)
      @prePostCondition<"repeatForward", boolean>(forwardPreconditionWithContext, forwardPostconditionWithContext)
      @argumentsTrap<"repeatForward">(callForwardSpy)
      @bodyTrap<"repeatForward">(exitEarly)
      @returnTrap<"repeatForward">(returnForwardSpy)
      repeatForward(s: string, n: number): string
      {
        return super.repeatForward(s, n);
      }

      repeatBack(n: number, s: string): string
      {
        return super.repeatBack(n, s);
      }
    });
  }).not.toThrow();

  expect(() => {
    void(class extends NumberStringClass {
      @preCondition<"repeatForward">(forwardPreconditionNoContext)
      @prePostCondition<"repeatForward", boolean>(forwardPreconditionWithContext, forwardPostconditionWithContext)
      @postCondition<"repeatForward">(forwardPostconditionNoContext)
      @argumentsTrap<"repeatForward">(callForwardSpy)
      @bodyTrap<"repeatForward">(exitEarly)
      @returnTrap<"repeatForward">(returnForwardSpy)
      repeatForward(s: string, n: number): string
      {
        return super.repeatForward(s, n);
      }

      repeatBack(n: number, s: string): string
      {
        return super.repeatBack(n, s);
      }
    });
  }).not.toThrow();

  expect(() => {
    void(class extends NumberStringClass {
      @preCondition<"repeatForward">(forwardPreconditionNoContext)
      @postCondition<"repeatForward">(forwardPostconditionNoContext)
      @argumentsTrap<"repeatForward">(callForwardSpy)
      @prePostCondition<"repeatForward", boolean>(forwardPreconditionWithContext, forwardPostconditionWithContext)
      @bodyTrap<"repeatForward">(exitEarly)
      @returnTrap<"repeatForward">(returnForwardSpy)
      repeatForward(s: string, n: number): string
      {
        return super.repeatForward(s, n);
      }

      repeatBack(n: number, s: string): string
      {
        return super.repeatBack(n, s);
      }
    });
  }).toThrow();

  expect(() => {
    void(class extends NumberStringClass {
      @preCondition<"repeatForward">(forwardPreconditionNoContext)
      @postCondition<"repeatForward">(forwardPostconditionNoContext)
      @argumentsTrap<"repeatForward">(callForwardSpy)
      @bodyTrap<"repeatForward">(setBar)
      @prePostCondition<"repeatForward", boolean>(forwardPreconditionWithContext, forwardPostconditionWithContext)
      @bodyTrap<"repeatForward">(getBar)
      @returnTrap<"repeatForward">(returnForwardSpy)
      repeatForward(s: string, n: number): string
      {
        return super.repeatForward(s, n);
      }

      repeatBack(n: number, s: string): string
      {
        return super.repeatBack(n, s);
      }
    });
  }).toThrow();

  expect(() => {
    void(class extends NumberStringClass {
      @preCondition<"repeatForward">(forwardPreconditionNoContext)
      @postCondition<"repeatForward">(forwardPostconditionNoContext)
      @argumentsTrap<"repeatForward">(callForwardSpy)
      @bodyTrap<"repeatForward">(exitEarly)
      @prePostCondition<"repeatForward", boolean>(forwardPreconditionWithContext, forwardPostconditionWithContext)
      @returnTrap<"repeatForward">(returnForwardSpy)
      repeatForward(s: string, n: number): string
      {
        return super.repeatForward(s, n);
      }

      repeatBack(n: number, s: string): string
      {
        return super.repeatBack(n, s);
      }
    });
  }).toThrow();

  expect(() => {
    void(class extends NumberStringClass {
      @preCondition<"repeatForward">(forwardPreconditionNoContext)
      @postCondition<"repeatForward">(forwardPostconditionNoContext)
      @argumentsTrap<"repeatForward">(callForwardSpy)
      @bodyTrap<"repeatForward">(exitEarly)
      @returnTrap<"repeatForward">(returnForwardSpy)
      @prePostCondition<"repeatForward", boolean>(forwardPreconditionWithContext, forwardPostconditionWithContext)
      repeatForward(s: string, n: number): string
      {
        return super.repeatForward(s, n);
      }

      repeatBack(n: number, s: string): string
      {
        return super.repeatBack(n, s);
      }
    });
  }).toThrow();

  expect(() => {
    void(class extends NumberStringClass {
      @bodyTrap<"repeatForward">(setBar)
      @argumentsTrap<"repeatForward">(callForwardSpy)
      @bodyTrap<"repeatForward">(getBar)
      @returnTrap<"repeatForward">(returnForwardSpy)
      repeatForward(s: string, n: number): string
      {
        return super.repeatForward(s, n);
      }

      repeatBack(n: number, s: string): string
      {
        return super.repeatBack(n, s);
      }
    });
  }).toThrow();

  expect(() => {
    void(class extends NumberStringClass {
      @bodyTrap<"repeatForward">(getBar)
      @argumentsTrap<"repeatForward">(callForwardSpy)
      @returnTrap<"repeatForward">(returnForwardSpy)
      repeatForward(s: string, n: number): string
      {
        return super.repeatForward(s, n);
      }

      repeatBack(n: number, s: string): string
      {
        return super.repeatBack(n, s);
      }
    });
  }).toThrow();

  expect(() => {
    void(class extends NumberStringClass {
      @bodyTrap<"repeatForward">(getBar)
      @returnTrap<"repeatForward">(returnForwardSpy)
      @argumentsTrap<"repeatForward">(callForwardSpy)
      repeatForward(s: string, n: number): string
      {
        return super.repeatForward(s, n);
      }

      repeatBack(n: number, s: string): string
      {
        return super.repeatBack(n, s);
      }
    });
  }).toThrow();

  expect(() => {
    void(class extends NumberStringClass {
      @returnTrap<"repeatForward">(returnForwardSpy)
      @bodyTrap<"repeatForward">(exitEarly)
      repeatForward(s: string, n: number): string
      {
        return super.repeatForward(s, n);
      }

      repeatBack(n: number, s: string): string
      {
        return super.repeatBack(n, s);
      }
    });
  }).toThrow();
});