import type {
  MixinClass
} from "../../source/MixinClass.mjs";

import {
  type SubclassDecorator
} from "../../source/DecoratedClass.mjs";

import BaseClassFixture from "./BaseClass.mjs";

import type {
  StaticFoo,
  hasZ
} from "./DerivedInterfaces.mjs";

export const addStaticFooAndHasZ: SubclassDecorator<
  StaticFoo,
  hasZ,
  typeof BaseClassFixture
> = function(
  this: void,
  value: typeof BaseClassFixture,
  { kind, name }: ClassDecoratorContext,
) :
  MixinClass<StaticFoo, hasZ, typeof BaseClassFixture>
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
