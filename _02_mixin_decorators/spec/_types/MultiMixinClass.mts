import type {
  Class
} from "../../source/types/Class.mjs";

import type {
  MultiMixinClass
} from "../../source/types/MultiMixinClass.mjs";

import type {
  StaticAndInstance
} from "../../source/types/StaticAndInstance.mjs";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

// #endregion test fixtures

it("MultiMixinClass defines a class taking multiple interfaces", () => {
  const secondKey = Symbol("key 2");
  const thirdKey = Symbol("key 3");

  type SecondStaticAndInstance = RightExtendsLeft<StaticAndInstance<typeof secondKey>, {
    staticFields: {
      middle: string;
    },
    instanceFields: {
      isMiddle: boolean;
    },
    symbolKey: typeof secondKey;
  }>;

  type ThirdStaticAndInstance = RightExtendsLeft<StaticAndInstance<typeof thirdKey>, {
    staticFields: {
      readonly ending: string;
    },
    instanceFields: {
      readonly length: number;
    },
    symbolKey: typeof thirdKey;
  }>;

  type FirstClassInterface = {
    readonly index: number;
  };

  class FirstClass {
    static beginning = 'opening';

    readonly index: number;

    constructor(myIndex: number) {
      this.index = myIndex;
    }
  }

  expect<Class<FirstClassInterface, [number]>>(FirstClass).toBeTruthy();

  class FullClass extends FirstClass
  {
    static middle = "middle string";
    static ending = "ending string";

    isMiddle = false;
    length = 0;
  }

  expect<
    MultiMixinClass<
      [SecondStaticAndInstance, ThirdStaticAndInstance],
      Class<FirstClassInterface, [number]>
    >
  >(FullClass).toBeTruthy();
});
