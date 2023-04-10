import type {
  MergeClass
} from "../../source/MergeClass.mjs";

import {
  type SubclassDecorator
} from "../../source/DecoratedClass.mjs";

import BaseClassFixture, {
  type BaseClassFixtureInstance,
} from "./BaseClass.mjs";

import type {
  StaticFoo,
  hasZ
} from "./DerivedInterfaces.mjs";

export const addStaticFooAndHasZ: SubclassDecorator<
  StaticFoo,
  hasZ,
  typeof BaseClassFixture,
  BaseClassFixtureInstance
> = function(
  this: void,
  value: typeof BaseClassFixture,
  { kind, name }: ClassDecoratorContext,
) :
  MergeClass<StaticFoo, hasZ, typeof BaseClassFixture, BaseClassFixtureInstance>
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
