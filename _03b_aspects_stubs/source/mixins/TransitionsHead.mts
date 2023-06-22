import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";

import TransitionsHeadCallDecorator, {
  type HeadCallFields
} from "../decorators/headCall.mjs";

import AspectsStubBase from "../AspectsStubBase.mjs";

const TransitionsHeadStub = MultiMixinBuilder<[HeadCallFields], typeof AspectsStubBase>(
  [TransitionsHeadCallDecorator], AspectsStubBase
);

export default TransitionsHeadStub;
