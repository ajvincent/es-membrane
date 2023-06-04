import MultiMixinBuilder from "#stage_utilities/source/MultiMixinBuilder.mjs";

import IndeterminateReturnDecorator, {
  type IndeterminateReturnFields
} from "../stub-decorators/IndeterminateReturn.mjs";

import ConfigureStub from "#stub_classes/source/base/ConfigureStub.mjs";

const IndeterminateReturnStub = MultiMixinBuilder<[IndeterminateReturnFields], typeof ConfigureStub>(
  [IndeterminateReturnDecorator], ConfigureStub
);

export default IndeterminateReturnStub;
