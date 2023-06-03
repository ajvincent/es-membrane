import MultiMixinBuilder from "#stage_utilities/source/MultiMixinBuilder.mjs";

import DefineExtraParamsShortDecorator, {
  type DefineExtraParamsShortFields
} from "./decorators/defineExtraParamsShort.mjs";

import BuildMethodBodyDecorator, {
  type BuildMethodBodyFields
} from "./decorators/buildMethodBody.mjs";

import ConfigureStub from "../base/ConfigureStub.mjs";

const TransitionsBaseStub = MultiMixinBuilder<[DefineExtraParamsShortFields, BuildMethodBodyFields], typeof ConfigureStub>(
  [DefineExtraParamsShortDecorator, BuildMethodBodyDecorator], ConfigureStub
);

export default TransitionsBaseStub;
