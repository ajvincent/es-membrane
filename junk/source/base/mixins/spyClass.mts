import MultiMixinBuilder from "#stage_utilities/source/MultiMixinBuilder.mjs";

import ConfigureStub from "../ConfigureStub.mjs";

import SpyClassDecorator, {
  type SpyClassFields
} from "../decorators/spyClass.mjs";

import WrapTypeInCtorDecorator, {
  type WrapTypeInCtorFields
} from "../decorators/wrapTypeInCtor.mjs";

import VoidClassDecorator, {
  type VoidClassFields
} from "../decorators/voidClass.mjs";

import {
  SPY_BASE,
} from "../../symbol-keys.mjs";

import SpyBase from "#stage_utilities/source/SpyBase.mjs";

export interface HasSpy {
  readonly [SPY_BASE]: SpyBase;
}

const SpyClassStub = MultiMixinBuilder<
  [
    VoidClassFields,
    SpyClassFields,
    WrapTypeInCtorFields,
  ],
  typeof ConfigureStub
>
(
  [
    VoidClassDecorator,
    SpyClassDecorator,
    WrapTypeInCtorDecorator,
  ],
  ConfigureStub
);

export default SpyClassStub;
