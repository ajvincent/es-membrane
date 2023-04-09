import markDecorated from "../../source/DecoratedClass.mjs";

import BaseClassFixture, {
  type BaseClassFixtureInstance,
} from "./BaseClass.mjs";

import type {
  StaticFoo,
  hasZ
} from "./DerivedInterfaces.mjs";

import { addStaticFooAndHasZ } from "./DerivedClassDecorator.mjs"

const DerivedFixtureClass = markDecorated<
  StaticFoo,
  hasZ,
  typeof BaseClassFixture,
  BaseClassFixtureInstance
>
(
  @addStaticFooAndHasZ
  class extends BaseClassFixture {}
);

export default DerivedFixtureClass;
