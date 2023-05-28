import MultiMixinBuilder from "#stage_utilities/source/MultiMixinBuilder.mjs";

import ConfigureStub from "./baseStub.mjs";

import SpyClassDecorator, {
  type SpyClassFields
} from "./decorators/spyClass.mjs";

import VoidClassDecorator, {
  type VoidClassFields
} from "./decorators/voidClass.mjs";

const SpyClassStub = MultiMixinBuilder<[SpyClassFields, VoidClassFields], typeof ConfigureStub>
(
  [SpyClassDecorator, VoidClassDecorator], ConfigureStub
);

export default SpyClassStub;
