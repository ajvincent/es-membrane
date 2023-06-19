/* eslint-disable @typescript-eslint/unbound-method */

import { NumberStringType } from "../../fixtures/types/NumberStringType.mjs";
import NumberStringClass from "../../fixtures/NumberStringClass.mjs";

import type { Class } from "../../source/types/Class.mjs";

it("Class type works", () => {
  const NST_Class: Class<NumberStringType> = NumberStringClass;

  function matchesType<Type>(arg: Type): boolean {
    return Boolean(arg);
  }

  expect(matchesType<NumberStringType>(NST_Class.prototype)).toBe(true);

  const NST_Instance = new NST_Class;
  expect(matchesType<NumberStringType>(NST_Instance));

  type ClassWithArgs = Class<{counter: number}, [number]>;

  const MyClassWithNoArgs: ClassWithArgs = class {
    counter: number;
    constructor() {
        this.counter = 7;
    }
  }

  // @ts-expect-error mismatched against the type of the constructor.
  void(new MyClassWithNoArgs());

  const MyClassWithNumberArg: ClassWithArgs = class {
    counter: number;
    constructor(counter: number) {
      this.counter = counter;
    }
  }

  void(new MyClassWithNumberArg(7));
});
