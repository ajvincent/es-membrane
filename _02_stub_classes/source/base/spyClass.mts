import MultiMixinBuilder from "#stage_utilities/source/MultiMixinBuilder.mjs";

import ConfigureStub from "./baseStub.mjs";

import SpyClassDecorator, {
  type SpyClassFields
} from "./decorators/spyClass.mjs";

import WrapThisInnerDecorator, {
  type WrapThisInnerFields
} from "./decorators/wrapThisInner.mjs";

import VoidClassDecorator, {
  type VoidClassFields
} from "./decorators/voidClass.mjs";

const SpyClassStub = MultiMixinBuilder<[SpyClassFields, WrapThisInnerFields, VoidClassFields], typeof ConfigureStub>
(
  [SpyClassDecorator, WrapThisInnerDecorator, VoidClassDecorator], ConfigureStub
);

export default SpyClassStub;
