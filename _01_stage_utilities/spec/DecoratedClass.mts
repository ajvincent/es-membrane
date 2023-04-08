import markDecorated, {
  DecoratedClass,
  type SubclassDecorator
} from "../source/DecoratedClass.mjs";

// #region base class and interfaces

interface StaticY {
  y(): number;
}
interface XP {
  x: number;
  get p() : number;
}

const addStaticFooAndHasZ: SubclassDecorator<
  StaticFoo,
  hasZ,
  typeof BaseClass,
  XP,
  [x: number]
> = function(
  this: void,
  value: typeof BaseClass,
  { kind, name }: ClassDecoratorContext,
): DecoratedClass<StaticFoo, hasZ, typeof BaseClass, XP, [x: number]>
{
  if (kind === "class") {
    void(name);
    const derived = class extends value implements hasZ {
      static readonly foo = "hi";
      readonly z = 7;
    }
    void(derived as typeof BaseClass & StaticY & StaticFoo);
    return derived;
  }

  throw new Error("unexpected");
}

@addStaticFooAndHasZ
class BaseClass implements XP
{
  static y(): number {
    return 5;
  }

  readonly x: number;
  constructor(x: number) {
    this.x = x;
  }

  get p(): number {
    return 3;
  }
}
void(BaseClass as typeof BaseClass & StaticY);

// #endregion base class and interfaces

// #region derived class from decorator, interfaces
interface StaticFoo {
  readonly foo: string;
}
interface hasZ {
  readonly z: number;
}

// #endregion derived class and interfaces

const DerivedClass = markDecorated<
  StaticFoo,
  hasZ,
  typeof BaseClass,
  XP,
  [x: number]
>(BaseClass);

it("We can get a decorated class with derived types (including static fields)", () => {
  const derivedObject = new DerivedClass(4);

  // base instance properties
  expect(derivedObject.p).toBe(3);
  expect(derivedObject.x).toBe(4);

  // derived instance properties
  expect(derivedObject.z).toBe(7);

  // base class properties
  expect(DerivedClass.y()).toBe(5);

  // derived class properties
  expect(DerivedClass.foo).toBe("hi");
});
