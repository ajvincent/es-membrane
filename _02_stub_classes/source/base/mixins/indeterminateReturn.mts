import MultiMixinBuilder from "#stage_utilities/source/MultiMixinBuilder.mjs";

import IndeterminateReturnDecorator, {
  type IndeterminateReturnFields
} from "../decorators/IndeterminateReturn.mjs";

import ConfigureStub from "../ConfigureStub.mjs";

const IndeterminateReturnStub = MultiMixinBuilder<[IndeterminateReturnFields], typeof ConfigureStub>(
  [IndeterminateReturnDecorator], ConfigureStub
);

export default IndeterminateReturnStub;