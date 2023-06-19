import type {
  SubclassDecorator
} from "#mixin_decorators/source/types/SubclassDecorator.mjs";

import type {
  Class
} from "#mixin_decorators/source/types/Class.mjs";

import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import type {
  RightExtendsLeft
} from "#mixin_decorators/source/types/Utility.mjs";

import {
  MultiMixinClass
} from "#mixin_decorators/source/types/MultiMixinClass.mjs"

import NumberStringClass from "#aspects/test-fixtures/fixtures/components/NumberStringClass.mjs";
import type {
  NumberStringType
} from "#aspects/test-fixtures/fixtures/types/NumberStringType.mjs";

declare const ClassInvariantKey: unique symbol;

it("Aspects mockups: Class Invariants", () => {
  interface NST_Interface extends NumberStringType {
    _inClass: boolean;
  }

  function NST_Invariant(this: NST_Interface): void {
    if (this._inClass) {
      throw new Error("foo");
    }
  }

  const INVARIANTS = Symbol("invariants");

  type ClassInvariantFields = RightExtendsLeft<StaticAndInstance<typeof ClassInvariantKey>, {
    staticFields: {
      readonly [INVARIANTS]: ((this: NST_Interface) => void)[];
    },
    instanceFields: object,
    symbolKey: typeof ClassInvariantKey,
  }>;

  const classInvariant: SubclassDecorator<
    Class<NST_Interface>,
    ClassInvariantFields,
    [(this: NST_Interface) => void]
  > = function(
    invariant: (this: NST_Interface) => void
  ): SubclassDecorator<Class<NST_Interface>, ClassInvariantFields, false>
  {
    return function(
      baseClass: Class<NST_Interface>,
      context: ClassDecoratorContext
    ): MultiMixinClass<[ClassInvariantFields], Class<NST_Interface>>
    {
      void(context);
      return class ClassInvariantsOfNST extends baseClass {
        static readonly [INVARIANTS] = [invariant];

        repeatForward(s: string, n: number): string {
          ClassInvariantsOfNST[INVARIANTS].forEach(invariant => invariant.apply(this));
          const rv = super.repeatForward(s, n);
          ClassInvariantsOfNST[INVARIANTS].forEach(invariant => invariant.apply(this));
          return rv;
        }

        repeatBack(n: number, s: string): string {
          ClassInvariantsOfNST[INVARIANTS].forEach(invariant => invariant.apply(this));
          const rv = super.repeatBack(n, s);
          ClassInvariantsOfNST[INVARIANTS].forEach(invariant => invariant.apply(this));
          return rv;
        }
      }
    }
  }

  @classInvariant(NST_Invariant)
  class NST_Class extends NumberStringClass implements NST_Interface {
    _inClass = false;
  }

  const nst = new NST_Class;
  expect<string>(nst.repeatForward("foo", 3)).toBe("foofoofoo");
});
