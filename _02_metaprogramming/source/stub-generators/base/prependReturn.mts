import MultiMixinBuilder from "../../../../_01_stage_utilities/source/MultiMixinBuilder.mjs";

import ConfigureStub from "./baseStub.mjs";

import PrependReturnDecorator, {
  type PrependReturnFields
} from "./decorators/prependReturn.mjs";

const PrependReturnStub = MultiMixinBuilder<[PrependReturnFields], typeof ConfigureStub>(
  [PrependReturnDecorator], ConfigureStub
);

export default PrependReturnStub;
