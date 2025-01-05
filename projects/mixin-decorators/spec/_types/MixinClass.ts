import type {
  MixinClass
} from "../../source/types/MixinClass.js";

// #region test fixtures
type FirstClassInterface = {
	readonly index: number;
};
class FirstClass implements FirstClassInterface {
	static beginning = 'opening';

	readonly index: number;

	constructor(myIndex: number) {
		this.index = myIndex;
	}
}

type SecondClassStaticInterface = {
	middle: string;
};
type SecondClassInterface = {
	isMiddle: boolean;
};

type SecondClassType = MixinClass<SecondClassStaticInterface, SecondClassInterface, typeof FirstClass>;
class SecondClass extends FirstClass {
	static middle = 'second class';
	isMiddle = true;
}

function buildSecondClass<Middle extends string, IsMiddle extends boolean>(
	middle: Middle,
	isMiddle: IsMiddle,
): SecondClassType {
	return class extends FirstClass {
		static middle = middle;
		isMiddle = isMiddle;
	};
}

type ThirdClassType = MixinClass<ThirdClassStaticInterface, ThirdClassInterface, SecondClassType>;

type ThirdClassStaticInterface = {
	readonly ending: string;
};
type ThirdClassInterface = {
	readonly length: number;
};

function buildThirdClass<Tail extends string, Length extends number>(tail: Tail, length: Length): ThirdClassType {
	return class extends buildSecondClass('fake middle class', true) {
		static ending = tail;
		length = length;
	};
}

type ClassTypeWithDifferentArguments = MixinClass<
  SecondClassStaticInterface,
  SecondClass,
  typeof FirstClass,
  [myIndex: number, isMiddle: boolean]
>;

function buildClassWithDifferentArguments(): ClassTypeWithDifferentArguments {
  return class extends FirstClass {
    static middle = "center";
    isMiddle: boolean;

    constructor(myIndex: number, isMissle: boolean) {
      super(myIndex);
      this.isMiddle = isMissle;
    }
  }
}

// #endregion test fixtures

it("MixinClass works", () => {
  expect<SecondClassType>(SecondClass).toBeTruthy();

  // @ts-expect-error missing isMiddle property
  expect<SecondClassType>(class extends FirstClass {
    static middle = 'second class';
  }).toBeTruthy();
  
  // @ts-expect-error missing static middle property
  expect<SecondClassType>(class extends FirstClass {
    isMiddle = true;
  }).toBeTruthy();
  
  expect<SecondClassType>(class {
    static middle = 'second class';
    static beginning = 'beginning';
  
    isMiddle = true;
    index: number;
  
    constructor(myIndex: number) {
      this.index = myIndex;
    }
  }).toBeTruthy();
  
  // @ts-expect-error missing isMiddle property
  expect<SecondClassType>(class {
    static beginning = 'beginning';
    isMiddle = true;
  
    index: number;
  
    constructor(myIndex: number) {
      this.index = myIndex;
    }
  }).toBeTruthy();
  
  // @ts-expect-error missing static middle property
  expect<SecondClassType>(class {
    static middle = 'second class';
    static beginning = 'beginning';
  
    index: number;
  
    constructor(myIndex: number) {
      this.index = myIndex;
    }
  }).toBeTruthy();
  
  // @ts-expect-error missing static beginning property
  expect<SecondClassType>(class {
    static middle = 'second class';
    isMiddle = true;
  
    index: number;
  
    constructor(myIndex: number) {
      this.index = myIndex;
    }
  }).toBeTruthy();
  
  // @ts-expect-error missing index property
  expect<SecondClassType>(class {
    static middle = 'second class';
    static beginning = 'beginning';
  
    isMiddle = true;
  
    constructor() {
      if (this.isMiddle) {
        this.isMiddle = false;
      }
    }
  }).toBeTruthy();
  
  expect<SecondClassType>(
    buildSecondClass('fake second class', false)
  ).toBeTruthy();
  
  expect<ThirdClassType>(class extends SecondClass {
    static ending: 'this is the end';
    length = 4;
  }).toBeTruthy();
  
  expect<ThirdClassType>(buildThirdClass('tail', 16)).toBeTruthy();

  const ClassWithDifferentArguments = buildClassWithDifferentArguments()
  const fourthObject = new ClassWithDifferentArguments(7, false);
  expect(fourthObject.index).toBe(7);
  expect(fourthObject.isMiddle).toBe(false);
});
