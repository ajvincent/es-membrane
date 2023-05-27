import MultiMixinBuilder from "../../../_01_stage_utilities/source/MultiMixinBuilder.mjs";

import TransitionsHeadCallDecorator, {
  type HeadCallFields
} from "./decorators/headCall.mjs";

import ConfigureStub from "../base/baseStub.mjs";

const TransitionsHeadStub = MultiMixinBuilder<[HeadCallFields], typeof ConfigureStub>(
  [TransitionsHeadCallDecorator], ConfigureStub
);

export default TransitionsHeadStub;
