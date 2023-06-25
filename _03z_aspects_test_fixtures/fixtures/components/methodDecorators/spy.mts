import type {
  ClassMethodDecorator
} from "#mixin_decorators/source/types/ClassMethodDecorator.mjs";

import type {
  NumberStringType
} from "#aspects/test-fixtures/fixtures/types/NumberStringType.mjs";

type SpyWithDecorator<Key extends keyof NumberStringType> = {
  events: unknown[][],
  spyDecorator: ClassMethodDecorator<NumberStringType, Key, true, false>,
};

export function createSpyDecoratorForward(): SpyWithDecorator<"repeatForward">
{
  const events: unknown[][] = [];
  function spyDecorator(
    method: NumberStringType["repeatForward"],
    context: ClassMethodDecoratorContext<NumberStringType, NumberStringType["repeatForward"]>
  ): NumberStringType["repeatForward"]
  {
    void(context);
    return function(...parameters: Parameters<NumberStringType["repeatForward"]>) {
      events.push(["repeatForward", ...parameters]);
      return method(...parameters);
    }
  }

  spyDecorator satisfies ClassMethodDecorator<
    NumberStringType, "repeatForward", true, false
  >;

  return { events, spyDecorator };
}

export function createSpyDecoratorBack(): SpyWithDecorator<"repeatBack">
{
  const events: unknown[][] = [];
  function spyDecorator(
    method: NumberStringType["repeatBack"],
    context: ClassMethodDecoratorContext<NumberStringType, NumberStringType["repeatBack"]>
  ): NumberStringType["repeatBack"]
  {
    void(context);
    return function(...parameters: Parameters<NumberStringType["repeatBack"]>) {
      events.push(["repeatBack", ...parameters]);
      return method(...parameters);
    }
  }

  spyDecorator satisfies ClassMethodDecorator<
    NumberStringType, "repeatBack", true, false
  >;

  return { events, spyDecorator };
}
