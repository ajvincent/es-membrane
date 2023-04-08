import markDecorated, {
  DecoratedClass,
  type SubclassDecorator
} from "../../source/DecoratedClass.mjs";

import BaseClassFixture, {
  type BaseClassFixtureInstance,
} from "./BaseClass.mjs";


interface StaticFoo {
  readonly foo: string;
}
interface hasZ {
  readonly z: number;
}

const addStaticFooAndHasZ: SubclassDecorator<
  StaticFoo,
  hasZ,
  typeof BaseClassFixture,
  BaseClassFixtureInstance,
  [x: number]
> = function(
  this: void,
  value: typeof BaseClassFixture,
  { kind, name }: ClassDecoratorContext,
): DecoratedClass<StaticFoo, hasZ, typeof BaseClassFixture, BaseClassFixtureInstance, [x: number]>
{
  if (kind === "class") {
    void(name);
    const derived = class extends value implements hasZ {
      static readonly foo = "hi";
      readonly z = 7;
    }
    void(derived as typeof value & StaticFoo);
    return derived;
  }

  throw new Error("unexpected");
}

const DerivedFixtureClass = markDecorated<
  StaticFoo,
  hasZ,
  typeof BaseClassFixture,
  BaseClassFixtureInstance,
  [x: number]
>
(
  @addStaticFooAndHasZ
  class extends BaseClassFixture {}
);

export default DerivedFixtureClass;
