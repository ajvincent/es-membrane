import MultiMixinBuilder from "#stage_utilities/source/MultiMixinBuilder.mjs";

import ConfigureStub from "./baseStub.mjs";

import VoidClassDecorator, {
  type VoidClassFields
} from "./decorators/voidClass.mjs";

import WrapThisInnerDecorator, {
  type WrapThisInnerFields
} from "./decorators/wrapThisInner.mjs";

const WrapThisInnerStub = MultiMixinBuilder<[WrapThisInnerFields, VoidClassFields], typeof ConfigureStub>
(
  [WrapThisInnerDecorator, VoidClassDecorator], ConfigureStub
);

export default WrapThisInnerStub;
