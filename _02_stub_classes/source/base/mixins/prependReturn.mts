import MultiMixinBuilder from "#stage_utilities/source/MultiMixinBuilder.mjs";

import ConfigureStub from "../ConfigureStub.mjs";

import PrependReturnDecorator, {
  type PrependReturnFields
} from "../decorators/prependReturn.mjs";

import VoidClassDecorator, {
  type VoidClassFields
} from "../decorators/voidClass.mjs";

const PrependReturnStub = MultiMixinBuilder<[VoidClassFields, PrependReturnFields], typeof ConfigureStub>(
  [VoidClassDecorator, PrependReturnDecorator], ConfigureStub
);

export default PrependReturnStub;
